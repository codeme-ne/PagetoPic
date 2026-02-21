# URL -> Image Generator

Turn any website into a production-ready visual in one flow: scrape content, generate a prompt, render an image.

![Demo](public/demo/url-to-image-demo.gif)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcodeme-ne%2FGemini-Image-und-Prompt&env=FIRECRAWL_API_KEY,GEMINI_API_KEY,FAL_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,AUTH_RESEND_KEY,EMAIL_FROM,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,STRIPE_PRICE_STARTER,STRIPE_PRICE_CREATOR,STRIPE_PRICE_PRO&envDescription=API%20keys%20required%20to%20run%20this%20application)

## Target Users

- Solo founders and marketers who need fast social visuals from landing pages or blog posts.
- Agencies turning client URLs into campaign image variants.
- Engineers building AI content tooling with explicit cost and abuse controls.

## Example Inputs and Outputs

### Example 1: SaaS Landing Page -> Clean Product Hero
- Input URL: `https://example-saas.com`
- Intent: Hero image for LinkedIn launch post
- Output summary: clean UI composition, product headline, high-contrast CTA framing

### Example 2: Blog Post -> Editorial Illustration
- Input URL: `https://example.com/blog/ai-ops-playbook`
- Intent: Newsletter cover visual
- Output summary: conceptual illustration matching article theme and tone

### Example 3: Event Page -> Promotional Poster
- Input URL: `https://example-events.com/summit-2026`
- Intent: Event promo asset for X/Instagram
- Output summary: date/location emphasis, visual hierarchy optimized for social feeds

## Architecture

High-level flow:

```text
URL Input -> /api/scrape -> /api/gemini -> /api/imagen4 -> Rendered Image
                 |              |               |
                 |              |               +-> Credits debit/refund
                 |              +-> Streaming prompt output
                 +-> SSRF checks + provider fallback

Billing:
Stripe Checkout -> /api/webhooks/stripe -> awardCredits(user)
```

Detailed notes: [docs/architecture.md](docs/architecture.md)

## Technologies

- Firecrawl + Jina Reader fallback for URL extraction
- Google Gemini for prompt generation
- Fal.ai Imagen4 for image generation
- NextAuth + Resend for passwordless auth
- Upstash Redis for credits, rate limiting, and idempotency
- Stripe for credit-pack billing

## Environment Variables

### Required

- `FIRECRAWL_API_KEY`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
- `FAL_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AUTH_RESEND_KEY`
- `EMAIL_FROM`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_PRO`

### Optional

- `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`
- `GEMINI_MODEL_ID`
- `SCRAPER_PROVIDER` (`jina`, `firecrawl`, `auto`)
- `TRUSTED_PROXY`, `DEBUG_CREDITS`
- `CREDITS_STARTER`, `CREDITS_CREATOR`, `CREDITS_PRO`
- `STRIPE_COUPON_STARTER7`

Reference file: [`.env.example`](.env.example)

## Quickstart

1. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
2. Create env file and fill required keys:
   ```bash
   cp .env.example .env.local
   ```
3. Start local dev server:
   ```bash
   pnpm run dev
   ```
4. Run the smoke test in another terminal:
   ```bash
   curl -X POST http://localhost:3000/api/check-env
   ```
5. Open `http://localhost:3000`, sign in, run one URL -> image flow.

## Smoke Test

Expected smoke test signals:
- `/api/check-env` returns no missing required keys in your setup.
- `/api/scrape` accepts a public URL and returns markdown.
- `/api/gemini` streams prompt output.
- `/api/imagen4` returns image payload when credits are available.

## Testing

```bash
pnpm run test:run
pnpm run test:coverage
```

Test suites include:
- Unit tests for `lib/` and URL validation rules
- Integration-like tests for credits, webhook validation, scrape/prompt pipeline glue

See [tests/README.md](tests/README.md) for strategy and scope.

## Troubleshooting

1. Missing API key / 500 config error:
   - Verify `.env.local` keys and restart dev server.
2. Stripe webhook signature failures:
   - Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe CLI/webhook endpoint secret.
3. Unauthorized responses:
   - Confirm NextAuth sign-in completed and session cookie exists.
4. Rate-limit errors in development:
   - Check Upstash vars; without valid Redis config the app fails open locally.
5. Out-of-credits / daily-cap reached:
   - Trigger checkout flow or adjust local credit env values for test mode.

## Known Limitations

- Prompt quality depends on source page quality and scrape completeness.
- Some dynamic pages yield partial extraction results.
- No offline mode; external provider availability affects generation.

## Failure Modes

- Upstream provider outages (Firecrawl, Gemini, Fal.ai, Stripe)
- Invalid webhook signatures or stale webhook retries
- Aggressive input content causing prompt degradation
- Unexpected URL patterns blocked by SSRF safeguards

## Cost Notes

- Image generation consumes credits (1 credit per image request).
- Daily per-user cap is enforced in API (`/api/imagen4`).
- Running with paid providers means variable usage costs per request volume.

## Privacy and Security Notes

- Secrets belong in `.env.local` only; never commit real keys.
- Stripe webhook events are signature-verified before credit award.
- URL inputs are validated to reduce SSRF and metadata endpoint abuse.
- Rate limiting + credits + regen caps protect against automated abuse.

## Contributing

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Issue Templates](.github/ISSUE_TEMPLATE)
- [PR Template](.github/PULL_REQUEST_TEMPLATE.md)

## Security

- [Security Policy](SECURITY.md)
- Use GitHub Security Advisories for private vulnerability reporting.

## Open Source

Repository: https://github.com/codeme-ne/Gemini-Image-und-Prompt

## License

MIT
