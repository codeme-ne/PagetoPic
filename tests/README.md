# Test Strategy

## Scope

- `lib/*.test.ts`: unit coverage for core utilities and credit logic.
- `app/api/scrape/validateUrl.test.ts`: SSRF and URL-validation guardrails.
- `tests/integration/*.test.ts`: integration-like route behavior with mocked providers.

## Integration Test Areas

1. Credits flow (`/api/credits`) for trial grant and balance response.
2. Stripe webhook signature enforcement (`/api/webhooks/stripe`).
3. Scrape -> prompt pipeline glue (`/api/scrape` + `/api/gemini` route contracts).

## Commands

```bash
pnpm run test:run
pnpm run test:coverage
```
