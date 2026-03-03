---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, architecture, quality]
dependencies: []
---

# Decompose 1034-Line God Component (app/page.tsx)

## Problem Statement
`app/page.tsx` is 1034 lines with 15+ useState hooks, 7 handlers, 5 useEffects, 6 step views, inline data, and a dead interface. Exceeds the 800-line project limit. All state changes re-render the entire component. No code splitting possible. The `thinking` array creates O(n^2) copies during streaming.

## Findings
- **Source:** Performance Reviewer, Architecture Reviewer, Code Quality Reviewer
- **Location:** `app/page.tsx` (entire file, 1034 lines)

## Proposed Solutions

### Option A: Extract steps + useReducer + data files (Recommended)
1. Move `imageStyleOptions` to `data/image-styles.ts`
2. Replace 15+ useState with `useReducer` or XState state machine
3. Extract each step to component: `StepUrlInput`, `StepStyleSelect`, etc.
4. Extract `UrlToImageProgressBar` to `components/progress-bar.tsx`
5. Batch thinking array updates to prevent jank
6. Remove dead `ApiError` interface and empty fragment wrapper
- **Effort:** Large | **Risk:** Medium

## Acceptance Criteria
- [ ] `app/page.tsx` under 200 lines
- [ ] Each step is a separate component
- [ ] State managed by reducer/state machine
- [ ] No O(n^2) thinking array copies
- [ ] Dead code removed (ApiError interface, unused fragment)

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified across all 4 review agents | |
