import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockIsRateLimited = vi.fn();
const mockAuth = vi.fn();
const mockEnsureTrial = vi.fn();
const mockGetCredits = vi.fn();
const mockValidateUrl = vi.fn();
const mockScrape = vi.fn();
const mockGetScraperProvider = vi.fn();
const mockCreateGoogleGenerativeAI = vi.fn();
const mockStreamText = vi.fn();

vi.mock('@/lib/rate-limit', () => ({
  isRateLimited: mockIsRateLimited,
}));

vi.mock('@/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/credits', () => ({
  ensureTrial: mockEnsureTrial,
  getCredits: mockGetCredits,
}));

vi.mock('@/lib/validateUrl', () => ({
  validateUrl: mockValidateUrl,
}));

vi.mock('@/lib/scraper', () => ({
  scrape: mockScrape,
  getScraperProvider: mockGetScraperProvider,
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: mockCreateGoogleGenerativeAI,
}));

vi.mock('ai', () => ({
  streamText: mockStreamText,
}));

async function* streamChunks(chunks: unknown[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

describe('integration: scrape -> prompt pipeline glue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    process.env.GEMINI_API_KEY = 'gemini_test_key';

    mockIsRateLimited.mockResolvedValue({ success: true, limit: 50, remaining: 49 });
    mockAuth.mockResolvedValue({ user: { id: 'user-1', email: 'user@example.com' } });
    mockEnsureTrial.mockResolvedValue({ granted: false, balance: 3 });
    mockGetCredits.mockResolvedValue(3);
  });

  it('passes scraped content into prompt generation flow', async () => {
    mockValidateUrl.mockReturnValue({ valid: true });
    mockGetScraperProvider.mockReturnValue('jina');
    mockScrape.mockResolvedValue({
      success: true,
      data: {
        markdown: '# Product update\n\nAI workflow shipped.',
      },
      provider: 'jina',
    });

    mockCreateGoogleGenerativeAI.mockReturnValue(() => 'mock-model');
    mockStreamText.mockReturnValue({
      fullStream: streamChunks([
        { type: 'text.delta', textDelta: 'Use a clean editorial style with warm lighting.' },
      ]),
    });

    const { POST: scrapePost } = await import('@/app/api/scrape/route');

    const scrapeRequest = new NextRequest('http://localhost/api/scrape', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/post' }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const scrapeResponse = await scrapePost(scrapeRequest);
    const scrapeJson = await scrapeResponse.json();

    expect(scrapeResponse.status).toBe(200);
    expect(scrapeJson.success).toBe(true);
    expect(scrapeJson.data.markdown).toContain('AI workflow shipped.');

    const promptInput = `Create an image prompt from this markdown:\n\n${scrapeJson.data.markdown}`;

    const { POST: geminiPost } = await import('@/app/api/gemini/route');

    const geminiRequest = new NextRequest('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: promptInput }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const geminiResponse = await geminiPost(geminiRequest);
    const geminiBody = await geminiResponse.text();

    expect(geminiResponse.status).toBe(200);
    expect(geminiResponse.headers.get('Content-Type')).toContain('application/x-ndjson');
    expect(geminiBody).toContain('Use a clean editorial style with warm lighting.');
    expect(geminiBody).toContain('"type":"done"');

    expect(mockScrape).toHaveBeenCalledWith('https://example.com/post', 'jina', process.env.FIRECRAWL_API_KEY);
    expect(mockStreamText).toHaveBeenCalledTimes(1);
  });
});
