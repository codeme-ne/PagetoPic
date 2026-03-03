---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, security, ssrf]
dependencies: []
---

# Fix SSRF IPv6 Loopback Bypass in validateUrl

## Problem Statement
`validateUrl` checks for IPv6 loopback addresses (`::1`, `0:0:0:0:0:0:0:1`) but the WHATWG URL constructor stores them with square brackets (`[::1]`). The comparison never matches, allowing `http://[::1]:8080` and IPv4-mapped addresses like `http://[::ffff:169.254.169.254]` to bypass SSRF protection. The test file explicitly documents this as a "known limitation."

## Findings
- **Source:** Security Reviewer, Architecture Reviewer
- **Location:** `lib/validateUrl.ts` lines 26-38, test file lines 78-88
- **PoC:** `http://[::1]:8080/internal-admin` passes validation and reaches loopback

## Proposed Solutions

### Option A: Strip brackets and check IPv6 mapped addresses (Recommended)
```typescript
const cleanHostname = hostname.startsWith('[') && hostname.endsWith(']')
  ? hostname.slice(1, -1) : hostname;
// Check cleanHostname against loopback patterns
// Also check ::ffff: mapped IPv4 addresses
```
- **Pros:** Complete fix, handles all known bypass vectors
- **Cons:** Slightly more complex validation logic
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] `http://[::1]:8080` is blocked
- [ ] `http://[0:0:0:0:0:0:0:1]:8080` is blocked
- [ ] `http://[::ffff:127.0.0.1]` is blocked
- [ ] `http://[::ffff:169.254.169.254]` is blocked
- [ ] Existing IPv4 tests still pass
- [ ] Update test expectations (lines 82, 88) to `expect(result.valid).toBe(false)`

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | Known gap documented in tests |
