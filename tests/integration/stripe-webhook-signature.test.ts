import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockConstructEvent = vi.fn();
const mockRedisSet = vi.fn();
const mockAwardCredits = vi.fn();

vi.mock('stripe', () => {
  return {
    default: class Stripe {
      webhooks = {
        constructEvent: mockConstructEvent,
      };
    },
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      set: mockRedisSet,
    }),
  },
}));

vi.mock('@/lib/credits', () => ({
  awardCredits: mockAwardCredits,
}));

describe('integration: /api/webhooks/stripe signature validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    mockRedisSet.mockResolvedValue('OK');
  });

  it('rejects requests with missing signature header', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ hello: 'world' }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Webhook not configured' });
  });

  it('rejects invalid webhook signatures', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_test' }),
      headers: {
        'stripe-signature': 't=123,v1=bad_signature',
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toContain('Webhook signature verification failed.');
    expect(mockConstructEvent).toHaveBeenCalledTimes(1);
    expect(mockAwardCredits).not.toHaveBeenCalled();
  });
});
