---
status: pending
priority: p1
issue_id: "003"
tags: [code-review, security, ssrf]
dependencies: []
---

# Validate Fal.ai Image URL Before Server-Side Fetch

## Problem Statement
`app/api/imagen4/route.ts` (lines 151-162) calls `fetch(imageUrl)` where `imageUrl` comes from the Fal.ai API response with zero URL validation. If the Fal.ai API is compromised or returns an unexpected URL, the server performs an SSRF request to any destination. Additionally, there is no timeout on this fetch.

## Findings
- **Source:** Security Reviewer, Performance Reviewer
- **Location:** `app/api/imagen4/route.ts` lines 151-162
- **Impact:** SSRF + potential indefinite hang on slow responses

## Proposed Solutions

### Option A: Allowlist Fal.ai CDN domains + add timeout (Recommended)
```typescript
const ALLOWED_IMAGE_HOSTS = ['fal.run', 'storage.googleapis.com', 'cdn.fal.ai'];
// Validate URL domain before fetch
// Add AbortController with 30s timeout
```
- **Pros:** Closes SSRF, prevents hangs, refunds on timeout
- **Cons:** Must maintain allowlist if Fal.ai changes CDN
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Image URL validated against allowlist before fetch
- [ ] Fetch has 30s timeout via AbortController
- [ ] Credit refund on timeout
- [ ] Non-HTTPS URLs are rejected

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security + performance review | |
