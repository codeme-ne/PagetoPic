---
status: pending
priority: p1
issue_id: "007"
tags: [code-review, security, billing]
dependencies: []
---

# Fix Stripe Initialized With Empty String Fallback

## Problem Statement
Both Stripe files construct the client with `new Stripe(process.env.STRIPE_SECRET_KEY || "", ...)`. The SDK accepts empty strings at construction, only failing at API call time with cryptic errors. The webhook route has no key guard at all.

## Findings
- **Source:** Code Quality Reviewer, Security Reviewer
- **Location:** `app/api/billing/checkout/route.ts` line 7, `app/api/webhooks/stripe/route.ts` line 8
- **Impact:** Silent misconfiguration, confusing runtime errors

## Proposed Solutions

### Option A: Fail fast with explicit validation (Recommended)
```typescript
if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "..." });
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Both files fail fast if STRIPE_SECRET_KEY is missing
- [ ] No `|| ""` fallback for API keys
- [ ] Update Stripe apiVersion to latest stable

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in code quality + security review | |
