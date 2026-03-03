---
status: pending
priority: p2
issue_id: "012"
tags: [code-review, architecture, dry]
dependencies: []
---

# Extract Duplicated Auth + Credits Boilerplate Into Shared Helper

## Problem Statement
Every API route repeats 10-15 lines of auth checking, user ID extraction, `session.user as { id?: string; email?: string }` cast, and `ensureTrial()` calls. The cast appears 5 times. `imagen4` uses `|| 'unknown'` while others use `|| ''` - inconsistent behavior.

## Findings
- **Source:** Code Quality Reviewer, Architecture Reviewer
- **Location:** All 5 API routes (scrape, gemini, imagen4, credits, checkout)

## Proposed Solutions

### Option A: Shared auth guard + NextAuth type augmentation (Recommended)
1. Create `types/next-auth.d.ts` to augment Session type
2. Create `lib/auth-guard.ts` with `requireAuth()` helper
3. Replace all 5 route boilerplate instances
- **Effort:** Medium | **Risk:** Low

## Acceptance Criteria
- [ ] Single `requireAuth()` function used across all routes
- [ ] No `as` casts for session.user
- [ ] Consistent error responses for 401

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in code quality + architecture review | |
