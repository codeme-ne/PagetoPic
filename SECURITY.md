# Security Policy

## Supported Versions

Security fixes are applied to the latest `main` branch.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report security concerns privately via GitHub Security Advisories:
- Go to `Security` tab in this repository
- Click `Report a vulnerability`

Include:
- A clear description of the issue
- Steps to reproduce
- Potential impact

You can expect an initial response within 5 business days.

## Secret Handling

- Store secrets only in `.env.local` (development) or platform secret managers (production).
- Never commit API keys, webhook secrets, or auth secrets.
- Rotate compromised keys immediately and redeploy.

## Webhook Validation

Stripe webhook processing requires:
- `STRIPE_WEBHOOK_SECRET` to be configured
- `stripe-signature` header validation before event handling
- Idempotency keys in Redis to avoid double credit awards

## Abuse Scenarios and Defenses

### Prompt Abuse
- Risk: malicious prompt content or policy-evasion prompts.
- Mitigations: auth-gated endpoints, per-endpoint rate limits, regeneration limits.

### Rate Limit Bypass Attempts
- Risk: high-volume automated request bursts.
- Mitigations: Redis-backed request limiting by endpoint/IP, trusted proxy handling, fallback safeguards.

### Billing Abuse
- Risk: replayed or forged webhook events, coupon misuse.
- Mitigations: Stripe signature verification, webhook idempotency key, dead-letter queue for failed credit awards.

## Release Security Checklist

Before each release:
- [ ] `.env.example` and docs match current secret requirements
- [ ] Stripe webhook validation path tested in staging
- [ ] Rate-limit behavior verified for scrape/gemini/imagen endpoints
- [ ] Credit debit/refund path tested for success + provider-failure cases
- [ ] No secrets, tokens, or private URLs in commit history
