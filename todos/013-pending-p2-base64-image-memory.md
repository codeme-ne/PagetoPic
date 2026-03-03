---
status: pending
priority: p2
issue_id: "013"
tags: [code-review, performance, scalability]
dependencies: []
---

# Replace Base64 Image Transfer With URL/Streaming

## Problem Statement
Images are fetched from Fal.ai, converted to base64, wrapped in JSON, and stored in React state. This triples server memory per request (10-15 MB each). 10 concurrent requests could hit OOM on serverless. Also leaks full Fal.ai response object (`falResponse: result`) to client.

## Findings
- **Source:** Performance Reviewer, Architecture Reviewer, Security Reviewer
- **Location:** `app/api/imagen4/route.ts` lines 155-176, `app/page.tsx` line 559

## Proposed Solutions

### Option A: Return image URL directly (Recommended)
- Return Fal.ai URL or signed proxy URL
- Client uses `<Image src={url}>` or `URL.createObjectURL(blob)`
- Remove `falResponse` from response
- **Effort:** Medium | **Risk:** Medium (changes client-side image handling)

### Option B: Stream binary response directly
- Return `Content-Type: image/png` response body
- Client creates blob URL from fetch response
- **Effort:** Medium | **Risk:** Low

## Acceptance Criteria
- [ ] No base64 encoding of images on server
- [ ] `falResponse` removed from API response
- [ ] Client properly displays and downloads images
- [ ] Memory usage reduced per concurrent request

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-03 | Identified in performance + architecture + security review | |
