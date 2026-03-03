---
status: pending
priority: p1
issue_id: "004"
tags: [code-review, security, dos]
dependencies: []
---

# Add Batch URL Size Limit to Prevent DoS

## Problem Statement
`/api/scrape` accepts a `urls` array and processes all URLs in parallel via `Promise.all()` with no size limit. An authenticated user can send thousands of URLs in one request, exhausting server resources, downstream API quotas, and bypassing per-request rate limiting.

## Findings
- **Source:** Security Reviewer, Architecture Reviewer
- **Location:** `app/api/scrape/route.ts` lines 90-121
- **Impact:** DoS via uncontrolled concurrency, rate limit bypass, API quota exhaustion

## Proposed Solutions

### Option A: Add MAX_BATCH_SIZE + concurrency limit (Recommended)
```typescript
const MAX_BATCH_SIZE = 5;
if (urls.length > MAX_BATCH_SIZE) return 400;
// Use Promise.allSettled with p-limit for controlled concurrency
```
- **Pros:** Simple fix, prevents all DoS vectors
- **Cons:** Limits legitimate batch usage (unlikely needed)
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Batch requests > 5 URLs return 400
- [ ] Each URL in batch is individually validated
- [ ] Concurrent scrape requests are limited

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
