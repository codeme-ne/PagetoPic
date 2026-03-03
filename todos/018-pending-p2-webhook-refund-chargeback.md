---
status: pending
priority: p2
issue_id: "018"
tags: [code-review, security, billing]
dependencies: []
---

# Handle Stripe Refunds and Chargebacks in Webhook

## Problem Statement
The webhook handler only processes `checkout.session.completed`. No handlers for `charge.refunded`, `payment_intent.payment_failed`, or `charge.dispute.created`. Users who chargeback retain credits permanently - a direct financial loss.

## Findings
- **Source:** Security Reviewer
- **Location:** `app/api/webhooks/stripe/route.ts` lines 57-82

## Proposed Solutions

### Option A: Add refund/dispute handlers (Recommended)
- Handle `charge.refunded` -> deduct credits
- Handle `charge.dispute.created` -> freeze/deduct credits
- Log to audit trail
- **Effort:** Medium | **Risk:** Low

## Acceptance Criteria
- [ ] `charge.refunded` triggers credit deduction
- [ ] `charge.dispute.created` triggers credit freeze
- [ ] All credit operations logged to audit trail

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
