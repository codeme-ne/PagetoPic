---
status: pending
priority: p2
issue_id: "014"
tags: [code-review, quality, architecture]
dependencies: []
---

# Centralize Magic Numbers Into Config Module

## Problem Statement
`DAILY_CAP=100` is duplicated in `imagen4/route.ts` and `credits/route.ts`. `MAX_TOTAL_PER_PROMPT=4`, TTL values (`86400`, `172800`), rate limit (`50`), and trial credits (`1` in callers vs `2` default in function) are all hardcoded across multiple files. Changes in one location silently break others.

## Findings
- **Source:** Code Quality Reviewer, Architecture Reviewer
- **Location:** `app/api/imagen4/route.ts` lines 40-41, `app/api/credits/route.ts` line 7, `lib/credits.ts` line 69, `lib/rate-limit.ts` lines 24, 81, 98

## Proposed Solutions

### Option A: Create `lib/config.ts` constants module (Recommended)
```typescript
export const APP_CONFIG = {
  credits: { trialAmount: 1, dailyCap: 100, maxRegenerationsPerPrompt: 4 },
  rateLimits: { requestsPerDay: 50 },
  ttl: { dailyUsage: 172800, regenSession: 86400 },
} as const;
```
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] All business constants in single `lib/config.ts`
- [ ] No hardcoded magic numbers in route handlers
- [ ] Trial credits consistent between callers and function default

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in code quality + architecture review | |
