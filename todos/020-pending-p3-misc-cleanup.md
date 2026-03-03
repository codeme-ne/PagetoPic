---
status: pending
priority: p3
issue_id: "020"
tags: [code-review, quality, cleanup]
dependencies: []
---

# Miscellaneous Code Quality Cleanup

## Problem Statement
Various small quality issues identified across the codebase.

## Findings (grouped)

1. **German placeholder** in `app/page.tsx:827` ("Hier wird der gescabte Inhalt...") - English UI with German placeholder
2. **No-op regex** in `app/page.tsx:181` (`.replace(/-ink-wash/g, '-ink-wash')` replaces with itself)
3. **Dead `thinkingRef`** in `app/page.tsx:220,575` - ref never attached to JSX
4. **Empty fragment** in `app/page.tsx:669-671` - unnecessary `<>...</>` wrapper
5. **`timestamp: ""`** placeholder in all `logCreditOp` calls in `lib/credits.ts` - always overwritten
6. **`fal.config()` called inside handler** per request in `app/api/imagen4/route.ts:78-80` - should be module-level
7. **Placeholder testimonials** in `data/use-cases.ts` referencing "PageTopic"
8. **Unused Radix UI deps** - 15+ unused packages from shadcn/ui scaffold
9. **Landing page not statically generated** - `auth()` in layout prevents ISR
10. **Style images missing `sizes` prop** in `app/page.tsx:736-742`
11. **Pin `next-auth` to exact beta version** (remove `^` prefix)
12. **Prompt injection** - scraped content sent unfiltered to Gemini (use system/user role separation)
13. **No prompt length limit** on /api/gemini and /api/imagen4

## Acceptance Criteria
- [ ] German placeholder replaced with English
- [ ] No-op regex removed
- [ ] Dead ref/effect removed or attached
- [ ] Empty fragment removed
- [ ] `timestamp` removed from logCreditOp call sites
- [ ] `fal.config()` moved to module level
- [ ] Unused dependencies audited and removed

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified across all review agents | |
