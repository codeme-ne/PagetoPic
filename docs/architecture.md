# Architecture

## Data Flow

1. User enters a URL and optional style preference.
2. `/api/scrape` validates the URL (SSRF checks) and extracts markdown content.
3. `/api/gemini` turns the extracted content into a visual prompt with streaming output.
4. `/api/imagen4` debits one credit, applies daily caps, and generates the final image.
5. Billing/webhook flow (`/api/billing/checkout`, `/api/webhooks/stripe`) replenishes credits.

## Runtime Model

- Edge runtime: lightweight streaming routes (`/api/gemini`, `/api/credits`)
- Node runtime: webhook and provider-heavy routes (`/api/webhooks/stripe`, `/api/imagen4`, `/api/scrape`)

## Trust Boundaries

- Browser to API: authenticated user boundary
- API to external providers: Firecrawl, Gemini, Fal.ai, Stripe
- Redis boundary: credits, rate limits, idempotency keys

## Core Reliability Mechanisms

- Rate-limit guards per endpoint
- Credit debit + refund logic for provider failures
- Stripe webhook signature verification + dead-letter queue
- SSRF protection for URL scraping
