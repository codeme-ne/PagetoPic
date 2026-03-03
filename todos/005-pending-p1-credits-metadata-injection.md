---
status: pending
priority: p1
issue_id: "005"
tags: [code-review, security, billing]
dependencies: []
---

# Add Credits Upper-Bound Validation in Stripe Webhook

## Problem Statement
The Stripe webhook handler reads credits from `session.metadata.credits` and awards them with `parseInt()` and no upper-bound validation. No `isNaN` check, no max range. If metadata is tampered with, arbitrary credits could be awarded. Also, promo codes `STARTER23` and `DANKE23` both reference `STRIPE_COUPON_STARTER7` (copy-paste bug).

## Findings
- **Source:** Security Reviewer, Code Quality Reviewer
- **Location:** `app/api/webhooks/stripe/route.ts` lines 61-65, `app/api/billing/checkout/route.ts` lines 25-41
- **Impact:** Potential arbitrary credit award, promo code misconfiguration

## Proposed Solutions

### Option A: Add validation + fix promo config (Recommended)
```typescript
const MAX_CREDITS_PER_PURCHASE = 1000;
if (!Number.isFinite(credits) || credits <= 0 || credits > MAX_CREDITS_PER_PURCHASE) {
  // Log and skip
}
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Credits value validated with upper bound in webhook
- [ ] `NaN` and negative values are rejected
- [ ] Promo codes have correct distinct env keys
- [ ] Add handler for `charge.refunded` / `charge.dispute.created`

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
