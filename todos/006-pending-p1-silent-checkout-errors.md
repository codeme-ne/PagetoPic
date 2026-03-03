---
status: pending
priority: p1
issue_id: "006"
tags: [code-review, quality, billing]
dependencies: []
---

# Fix Silent Error Swallowing in Billing Checkout Flow

## Problem Statement
`startCheckout` in both `app/page.tsx` and `components/credits-badge.tsx` silently swallows all errors with empty `catch {}`. If the checkout API fails, the user gets zero feedback. This is critical in a billing flow. The function is also duplicated between two files with divergent behavior.

## Findings
- **Source:** Code Quality Reviewer, Architecture Reviewer
- **Location:** `app/page.tsx` lines 607-628, `components/credits-badge.tsx` lines 52-75
- **Impact:** Users get no error feedback on payment failures

## Proposed Solutions

### Option A: Extract shared hook + add error handling (Recommended)
```typescript
// hooks/use-checkout.ts
export function useCheckout() {
  const [buying, setBuying] = useState<Pack | null>(null);
  const startCheckout = async (pack, options) => {
    try { ... } catch (err) {
      toast.error('Could not start checkout. Please try again.');
    } finally { setBuying(null); }
  };
  return { startCheckout, buying };
}
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Single `useCheckout` hook used in both components
- [ ] Errors show toast notification to user
- [ ] No empty catch blocks in billing code

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in code quality review | |
