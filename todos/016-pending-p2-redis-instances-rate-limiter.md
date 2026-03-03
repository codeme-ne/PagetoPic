---
status: pending
priority: p2
issue_id: "016"
tags: [code-review, performance, architecture]
dependencies: []
---

# Consolidate Redis Instances and Cache Rate Limiter

## Problem Statement
`Redis.fromEnv()` is called independently in 4 files. The rate limiter creates new `Redis` and `Ratelimit` instances on every request. Sequential Redis calls in imagen4 route (10-13 round-trips) add 10-65ms latency per request.

## Findings
- **Source:** Performance Reviewer, Architecture Reviewer
- **Location:** `lib/credits.ts` line 4, `lib/rate-limit.ts` line 20, `app/api/webhooks/stripe/route.ts` line 12, `auth.ts` line 25

## Proposed Solutions

### Option A: Shared Redis + cached rate limiter + pipelined operations (Recommended)
1. Create `lib/redis.ts` with single shared instance
2. Cache `Ratelimit` instances per endpoint in a `Map`
3. Combine independent Redis checks with `Promise.all`
4. Consider Lua script for combined daily-cap + credit-debit
- **Effort:** Medium | **Risk:** Low

## Acceptance Criteria
- [ ] Single shared Redis instance
- [ ] Rate limiter cached per endpoint
- [ ] Imagen4 route uses parallel Redis calls where possible

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in performance + architecture review | |
