---
status: pending
priority: p2
issue_id: "010"
tags: [code-review, security, api]
dependencies: []
---

# Allowlist Gemini Model Selection from X-Gemini-Model Header

## Problem Statement
`/api/gemini` reads the `X-Gemini-Model` request header and uses it directly as the AI model identifier with no validation. An attacker can specify expensive premium models at the application's cost.

## Findings
- **Source:** Security Reviewer
- **Location:** `app/api/gemini/route.ts` lines 78-84

## Proposed Solutions

### Option A: Allowlist valid models (Recommended)
```typescript
const ALLOWED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
const modelId = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-2.5-flash';
```
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] Only allowlisted models can be selected
- [ ] Unknown model falls back to default
- [ ] Header is optional (env var still works)

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security review | |
