---
status: pending
priority: p2
issue_id: "008"
tags: [code-review, performance, reliability]
dependencies: []
---

# Add Fetch Timeouts to All External HTTP Calls

## Problem Statement
`scrapeWithJina()`, `scrapeWithFirecrawl()`, and the image fetch in `imagen4/route.ts` all call `fetch()` without AbortSignal timeouts. Slow upstream services can hang requests indefinitely, tying up serverless function slots.

## Findings
- **Source:** Performance Reviewer, Code Quality Reviewer
- **Location:** `lib/scraper.ts` lines 44, 99; `app/api/imagen4/route.ts` line 155
- **Impact:** Indefinite hangs, function slot exhaustion, lost credits

## Proposed Solutions

### Option A: AbortController with configurable timeout (Recommended)
- 15s for scrapers, 30s for image fetch
- Refund credits on timeout
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] All external `fetch()` calls have AbortController timeouts
- [ ] Scraper timeout: 15 seconds
- [ ] Image fetch timeout: 30 seconds
- [ ] Credits refunded on Fal.ai timeout

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in performance + code quality review | |
