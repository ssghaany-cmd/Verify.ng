# Verify.ng

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Verify.ng is a community scam-reporting and business-verification PWA for Nigeria. Users search a bank account number, phone number, or business name and get an instant trust level based on community reports. Businesses can pay for a verification badge.

## Overview

- **Search**: look up an account/phone/business and see a trust level (`safe`, `caution`, `highRisk`, `danger`) derived from report count (see `src/lib/trustScore.ts`).
- **Report**: submit a scam report with optional evidence upload.
- **Recent scams**: public feed with upvotes.
- **Business verification**: apply, pay the badge fee via Monnify, then a Supabase Edge Function verifies the payment server-side.
- English and Nigerian Pidgin UI; installable PWA.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, Supabase (Postgres + Edge Functions), Monnify, Vitest + Testing Library.

## Setup

Requires Node 20+ (`.nvmrc` provided).

```bash
npm install
cp .env.example .env.local   # then fill in the values
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_MONNIFY_API_KEY` | Monnify public API key (checkout) |
| `VITE_MONNIFY_CONTRACT_CODE` | Monnify contract code |

Edge Function secrets (`MONNIFY_API_KEY`, `MONNIFY_SECRET_KEY`, optional `MONNIFY_BASE_URL`) are set with `supabase secrets set` and never ship to the browser. Apply the schema in `supabase/migrations/` to your project.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm test` | Run the Vitest suite once (no network or credentials needed) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build |

CI (`.github/workflows/ci.yml`) runs install, lint, typecheck, test, build and `npm audit` on every push and pull request.

## Architecture

- `src/pages/` – route-level screens (Home search, Report, Recent, Business verify, About, Legal)
- `src/components/` – shared UI (`TrustScoreCard`, header, nav, install prompt)
- `src/lib/` – pure logic and helpers: `trustScore.ts`, `format.ts`, `translations.ts`, `logger.ts`, Supabase client/types in `supabase.ts`, env-driven `config.ts`
- `supabase/migrations/` – database schema
- `supabase/functions/verify-payment/index.ts` – verifies a Monnify transaction server-side and approves the business verification
- `src/test/` – test setup; tests live next to the code as `*.test.ts(x)`; Supabase is mocked with `vi.mock('@/lib/supabase')`

## Contributing

Keep each change in a small commit that includes its tests. Errors in `catch` blocks must go through `logError(context, err)` from `src/lib/logger.ts`.

## License

Private; internal or limited distribution unless otherwise stated.
