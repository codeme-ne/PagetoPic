import { Redis } from "@upstash/redis";

// Centralized Redis instance from env
const redis = Redis.fromEnv();

// Structured logging helper for credit operations audit trail
type CreditLogData = {
  operation: string;
  userId: string;
  amount?: number;
  newBalance?: number;
  remaining?: number;
  success?: boolean;
  reason?: string;
  granted?: boolean;
};

function logCreditOp(data: CreditLogData): void {
  const shouldLog = process.env.NODE_ENV === "production" || process.env.DEBUG_CREDITS === "true";
  if (!shouldLog) return;

  console.log(JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
  }));
}

// Key helpers
const kCredits = (userId: string) => `credits:${userId}`;
const kTrialGranted = (userId: string) => `trial:granted:${userId}`;
const kDailyUsed = (userId: string, ymd: string) => `credits:dailyUsed:${userId}:${ymd}`;
const kRegen = (userId: string, sessionHash: string) => `regen:${userId}:${sessionHash}`;

export type DebitResult = {
  ok: boolean;
  remaining: number;
  dailyRemaining?: number;
  reason?: string;
};

export const todayYMD = () => {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

export async function getCredits(userId: string): Promise<number> {
  const v = await redis.get<number | null>(kCredits(userId));
  return typeof v === "number" ? v : 0;
}

export async function awardCredits(userId: string, amount: number): Promise<number> {
  const newBal = await redis.incrby(kCredits(userId), amount);

  logCreditOp({
    operation: "awardCredits",
    userId,
    amount,
    newBalance: newBal,
  });

  return newBal;
}

export async function ensureTrial(userId: string, trialCredits = 2): Promise<{ granted: boolean; balance: number }>{
  const set = await redis.set(kTrialGranted(userId), "1", { nx: true });
  if (set === "OK") {
    const bal = await awardCredits(userId, trialCredits);

    logCreditOp({
      operation: "ensureTrial",
      userId,
      granted: true,
      newBalance: bal,
    });

    return { granted: true, balance: bal };
  }
  const bal = await getCredits(userId);

  logCreditOp({
    operation: "ensureTrial",
    userId,
    granted: false,
    newBalance: bal,
  });

  return { granted: false, balance: bal };
}

export async function getDailyUsage(userId: string): Promise<number> {
  const used = await redis.get<number | null>(kDailyUsed(userId, todayYMD()));
  return typeof used === "number" ? used : 0;
}

export async function getDailyRemaining(userId: string, dailyCap: number): Promise<number> {
  const used = await getDailyUsage(userId);
  return Math.max(0, dailyCap - used);
}

export async function tryDebit(
  userId: string,
  amount: number,
  opts?: { dailyCap?: number }
): Promise<DebitResult> {
  const dailyCap = opts?.dailyCap ?? Infinity;
  if (Number.isFinite(dailyCap)) {
    const remainingToday = await getDailyRemaining(userId, dailyCap as number);
    if (remainingToday < amount) {
      const remaining = await getCredits(userId);

      logCreditOp({
        operation: "tryDebit",
        userId,
        amount,
        success: false,
        reason: "daily-cap-exceeded",
        remaining,
      });

      return { ok: false, remaining, dailyRemaining: remainingToday, reason: "daily-cap-exceeded" };
    }
  }

  // Atomic check-and-decrement using Lua script
  // Returns: new balance if successful, -1 if insufficient credits
  const luaScript = `
    local key = KEYS[1]
    local amount = tonumber(ARGV[1])
    local current = redis.call('GET', key)

    if current == false then
      current = 0
    else
      current = tonumber(current)
    end

    if current >= amount then
      return redis.call('DECRBY', key, amount)
    else
      return -1
    end
  `;

  const result = await redis.eval(
    luaScript,
    [kCredits(userId)],
    [amount.toString()]
  ) as number;

  if (result === -1) {
    const currentBalance = await getCredits(userId);

    logCreditOp({
      operation: "tryDebit",
      userId,
      amount,
      success: false,
      reason: "insufficient-credits",
      remaining: currentBalance,
    });

    return { ok: false, remaining: currentBalance, reason: "insufficient-credits" };
  }

  // increment daily usage and set TTL to end-of-day (~48h safety)
  const key = kDailyUsed(userId, todayYMD());
  const used = await redis.incrby(key, amount);
  // ensure key expires in ~2 days to avoid unbounded growth (172800 seconds)
  await redis.expire(key, 172800);
  const dailyRemaining = Number.isFinite(dailyCap) ? Math.max(0, (dailyCap as number) - used) : undefined;

  logCreditOp({
    operation: "tryDebit",
    userId,
    amount,
    success: true,
    remaining: result,
  });

  return { ok: true, remaining: result, dailyRemaining };
}

export async function refund(userId: string, amount: number): Promise<number> {
  const newBal = await awardCredits(userId, amount);

  logCreditOp({
    operation: "refund",
    userId,
    amount,
    newBalance: newBal,
  });

  return newBal;
}

/**
 * Generate a hash from a prompt string using Web Crypto API (Edge-compatible)
 * Falls back to FNV-1a hash for sync contexts
 */
export async function sessionHashFromPrompt(prompt: string): Promise<string> {
  // Use Web Crypto API (available in Edge runtime)
  const encoder = new TextEncoder();
  const data = encoder.encode(prompt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16);
}

export async function getRegenCount(userId: string, sessionHash: string): Promise<number> {
  const v = await redis.get<number | null>(kRegen(userId, sessionHash));
  return typeof v === "number" ? v : 0;
}

export async function incrementRegen(userId: string, sessionHash: string, ttlSeconds = 86400): Promise<number> {
  const key = kRegen(userId, sessionHash);
  const next = await redis.incr(key);
  if (next === 1) {
    await redis.expire(key, ttlSeconds);
  }
  return next;
}
