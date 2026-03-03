---
status: pending
priority: p2
issue_id: "009"
tags: [code-review, security, infrastructure]
dependencies: []
---

# Add HTTP Security Headers (CSP, HSTS, X-Frame-Options)

## Problem Statement
`next.config.ts` has no security headers. No CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy. This leaves the app vulnerable to clickjacking, MIME-sniffing attacks, and broadens XSS exploitation surface.

## Findings
- **Source:** Security Reviewer
- **Location:** `next.config.ts`

## Proposed Solutions

### Option A: Add headers() config in next.config.ts (Recommended)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS: max-age=63072000
- CSP: restrictive policy for self, inline styles, fal.ai images
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] All security headers present in production responses
- [ ] CSP does not break existing functionality
- [ ] Verified with securityheaders.com

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
