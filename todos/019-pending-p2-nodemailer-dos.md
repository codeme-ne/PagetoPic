---
status: pending
priority: p2
issue_id: "019"
tags: [code-review, security, dependency]
dependencies: []
---

# Update Nodemailer to Fix DoS Vulnerability

## Problem Statement
`nodemailer@^6.10.1` is vulnerable to DoS via recursive address parser. Also appears to be unused (Resend is used directly for auth emails). Either update or remove.

## Findings
- **Source:** Security Reviewer, Code Quality Reviewer
- **Location:** `package.json` line 62

## Proposed Solutions

### Option A: Remove if unused (Recommended)
- Check if any code imports nodemailer
- If unused, remove dependency entirely
- **Effort:** Small | **Risk:** Low

### Option B: Update to >=7.0.11
- **Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] Nodemailer either removed or updated to safe version
- [ ] No audit warnings for nodemailer

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in security + code quality review | |
