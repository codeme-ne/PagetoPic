---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, architecture, quality]
dependencies: ["012"]
---

# Use Existing Error Handler + Add Zod Input Validation

## Problem Statement
`lib/error-handler.ts` has correlation IDs, error classification, and structured logging but zero API routes use it. All routes have ad-hoc error handling. Additionally, Zod is a dependency but never used - all input validation is manual `typeof` checks and `as` casts.

## Findings
- **Source:** Architecture Reviewer, Code Quality Reviewer
- **Location:** `lib/error-handler.ts` (dead code), all API routes, `package.json` line 78 (Zod unused)

## Proposed Solutions

### Option A: Refactor routes to use error handler + add Zod schemas (Recommended)
1. Create Zod schemas for each API endpoint's request body
2. Create `apiHandler()` wrapper that auto-catches errors
3. Migrate all routes to use `handleNextError`/`handleEdgeError`
4. Standardize API response envelope
- **Effort:** Medium | **Risk:** Low

## Acceptance Criteria
- [ ] All API routes use centralized error handler
- [ ] Zod schemas validate all API inputs
- [ ] Consistent error response shape across all endpoints
- [ ] Correlation IDs in production error responses

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in architecture + code quality review | |
