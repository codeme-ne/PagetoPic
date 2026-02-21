import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.fn();
const mockEnsureTrial = vi.fn();
const mockGetCredits = vi.fn();
const mockGetDailyRemaining = vi.fn();

vi.mock('@/auth', () => ({ auth: mockAuth }));
vi.mock('@/lib/credits', () => ({
  ensureTrial: mockEnsureTrial,
  getCredits: mockGetCredits,
  getDailyRemaining: mockGetDailyRemaining,
}));

describe('integration: /api/credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns credits snapshot for authenticated user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', email: 'user@example.com' } });
    mockEnsureTrial.mockResolvedValue({ granted: false, balance: 5 });
    mockGetCredits.mockResolvedValue(5);
    mockGetDailyRemaining.mockResolvedValue(92);

    const { GET } = await import('@/app/api/credits/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ credits: 5, dailyRemaining: 92, dailyCap: 100 });

    expect(mockEnsureTrial).toHaveBeenCalledWith('user-1', 1);
    expect(mockGetCredits).toHaveBeenCalledWith('user-1');
    expect(mockGetDailyRemaining).toHaveBeenCalledWith('user-1', 100);
  });

  it('returns 401 for unauthenticated requests', async () => {
    mockAuth.mockResolvedValue(null);

    const { GET } = await import('@/app/api/credits/route');
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });
});
