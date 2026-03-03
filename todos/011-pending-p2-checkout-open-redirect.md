---
status: pending
priority: p2
issue_id: "011"
tags: [code-review, security, billing]
dependencies: []
---

# Fix Open Redirect via Origin Header in Checkout Route

## Problem Statement
`/api/billing/checkout` constructs Stripe success/cancel URLs from the raw `Origin` request header without validation. A malicious client can set `Origin: https://evil.com` to redirect users after payment.

## Findings
- **Source:** Security Reviewer
- **Location:** `app/api/billing/checkout/route.ts` lines 66, 110-111

## Proposed Solutions

### Option A: Allowlist trusted origins (Recommended)
```typescript
const allowedOrigins = new Set([process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean));
const origin = allowedOrigins.has(requestOrigin) ? requestOrigin : process.env.NEXTAUTH_URL;
```
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] Only allowlisted origins are used for redirect URLs
- [ ] Fallback to NEXTAUTH_URL if origin is untrusted

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
