import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { isRateLimited } from '@/lib/rate-limit';
import { auth } from '@/auth';
import {
  ensureTrial,
  tryDebit,
  refund,
  getCredits,
  getDailyRemaining,
  sessionHashFromPrompt,
  getRegenCount,
  incrementRegen,
} from '@/lib/credits';

// Configure fal client once at module level
fal.config({
  credentials: process.env.FAL_KEY,
});

interface FalImage {
  url: string;
  content_type?: string;
  width?: number;
  height?: number;
}

interface FalResponseData {
  images?: FalImage[];
  [key: string]: unknown;
}

interface FalResponse {
  data?: FalResponseData;
  status?: string;
  logs?: Array<{ message: string }>;
  [key: string]: unknown;
}

interface ApiError extends Error {
  status?: number;
}

export async function POST(request: NextRequest) {
  const DAILY_CAP = 100; // images per day
  const MAX_TOTAL_PER_PROMPT = 4; // 1 initial + 3 regenerations

  const rateLimit = await isRateLimited(request, 'imagen4');
  
  if (!rateLimit.success) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }, { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      }
    });
  }

  // Require authenticated user for debit/credits
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id?: string; email?: string }).id || (session.user as { email?: string }).email || 'unknown';
  if (!userId || userId === 'unknown') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Grant free trial (1 credit) once per user on first use
  await ensureTrial(userId, 1);

  if (!process.env.FAL_KEY) {
    return NextResponse.json({
      error: 'API configuration error. Please try again later or contact support.'
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { prompt } = body as { prompt?: string };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid request format. Please check your input and try again.' }, { status: 400 });
    }

    // Regeneration policy: limit to 1 initial + 3 extra for the same prompt (rolling 24h)
    const sessionHash = await sessionHashFromPrompt(prompt);
    const currentCount = await getRegenCount(userId, sessionHash);
    if (currentCount >= MAX_TOTAL_PER_PROMPT) {
      return NextResponse.json({
        error: 'Regeneration limit reached for this prompt. Tweak the prompt or start a new session.'
      }, { status: 429 });
    }

    // Debit exactly 1 credit (image generation). Enforce daily cap.
    const debit = await tryDebit(userId, 1, { dailyCap: DAILY_CAP });
    if (!debit.ok) {
      const remaining = debit.remaining ?? (await getCredits(userId));
      if (debit.reason === 'daily-cap-exceeded') {
        return NextResponse.json({
          error: 'Daily image limit reached. Try again tomorrow.',
          remaining,
          dailyRemaining: 0,
        }, {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-Credits-Remaining': String(remaining),
            'X-Daily-Remaining': '0',
          }
        });
      }

      return NextResponse.json({
        error: 'You are out of credits.',
        remaining,
      }, {
        status: 402,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-Credits-Remaining': String(remaining),
        }
      });
    }

    // After successful debit, record this generation for the prompt session
    await incrementRegen(userId, sessionHash, 86400);

    const result = await fal.subscribe("fal-ai/imagen4/preview", {
      input: {
        prompt: prompt,
      },
      logs: true,
    }) as FalResponse;

    const images = result?.data?.images;

    if (!images || images.length === 0 || !images[0].url) {
      console.error('Fal.ai did not return a valid image URL within the data object:', result);
      // Refund on provider failure
      await refund(userId, 1);
      return NextResponse.json({ error: 'Image generation failed. Please try again later.' }, { status: 500 });
    }

    const imageUrl = images[0].url;
    const imageContentType = images[0].content_type;


    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from URL: ${imageUrl}. Status: ${imageResponse.status}`);
      await refund(userId, 1);
      return NextResponse.json({ error: 'Failed to process generated image. Please try again later.' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const dailyRemaining = await getDailyRemaining(userId, DAILY_CAP);

    return NextResponse.json({
      imageBase64: imageBase64,
      contentType: imageContentType || 'image/png',
      falResponse: result
    }, {
      headers: {
        'X-Credits-Remaining': String(debit.remaining),
        'X-Daily-Remaining': String(dailyRemaining),
      }
    });

  } catch (error: unknown) {
    console.error('Error in /api/imagen4 endpoint:', error);
    const err = error as ApiError;
    if (err.message && err.message.includes("FAL_KEY")) {
        return NextResponse.json({ error: 'API configuration error. Please try again later or contact support.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An error occurred while processing your request. Please try again later.' }, { status: 500 });
  }
}
