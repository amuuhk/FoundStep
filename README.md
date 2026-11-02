# FoundStep

FoundStep is a React, TypeScript, and Vite application backed by Supabase.

## Get started

Requirements: Node.js 20.19+ or 22.12+ and npm.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` using your Supabase project settings.
4. Apply the SQL files in `supabase/migrations/` to your Supabase project in filename order.
5. Start the development server with `npm run dev`.

The app requires valid Supabase settings at startup. Do not commit `.env` or put service-role keys in frontend environment variables.

## Project layout

- `src/pages/` contains the main screens.
- `src/components/` contains shared UI and application shell components.
- `src/lib/api.ts` contains Supabase data-access functions; `auth.tsx` provides authentication state.
- `src/lib/types.ts`, `constants.ts`, and `gates.ts` hold shared domain types and rules.
- `supabase/migrations/` contains ordered database schema and security changes.

Use the `@/` alias for imports from `src/`.

## Adding a feature

1. Add or update domain types and shared rules in `src/lib/`.
2. Put Supabase queries and mutations in `src/lib/api.ts`; add database changes as a new, timestamped migration.
3. Add a screen in `src/pages/` and shared UI in `src/components/` where appropriate.
4. For an authenticated screen, add its page key and navigation entry in `src/components/AppShell.tsx`, then render it in `src/App.tsx`.
5. Preserve the existing Supabase Row Level Security policies when changing data access, and update the related migration and UI together.
6. Run the checks below before submitting the change.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`

There is not currently an automated test script in `package.json`.
