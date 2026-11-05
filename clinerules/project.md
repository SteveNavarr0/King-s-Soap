# King’s Soap — Project Instructions for Cline

## Project context

King’s Soap is an e-commerce website for Anita King’s family-owned soap business. Customers browse products, purchase items, and view order history. Administrators manage products and inventory. The project also integrates payments and shipping.

Treat the repository source, package scripts, and database migrations as the authority for current implementation. This file is based on the team’s supplied README and dependency list; do not assume every described feature is complete.

## Technology

- Frontend: React, Vite, and Tailwind CSS, located in `frontend/` according to the README.
- Data and authentication: Supabase and `@supabase/supabase-js`.
- Backend dependencies supplied by the team: Express 5, CORS, dotenv, Helmet, Morgan, and Multer.
- Integration SDKs supplied by the team: Stripe, EasyPost, and Brevo.

Locate the backend package and entry point before editing server code. The supplied dependency list does not establish the backend directory, startup command, middleware configuration, or integration behavior. Inspect existing code to confirm these details.

## README rules

- Update README.md when installation, configuration, or commands change.
- Document new required environment variables using placeholders only.
- Verify commands against package.json before documenting them.
- Keep frontend and backend setup instructions separate.
- Do not claim unfinished features are complete.
- Preserve contributor, ownership, and license information unless asked to change it.


## Before making changes

1. Read the root README and the relevant package.json files.
2. Inspect the files involved in the task and nearby examples of the same feature.
3. Identify the existing data flow between the React UI, backend, and Supabase.
4. Reuse existing authentication, authorization, API client, and UI patterns.
5. Keep changes focused on the requested behavior. Avoid unrelated formatting, renaming, or refactoring.
6. If essential information cannot be found in the repository, explain what is missing rather than inventing commands, schema, or requirements.

## Setup and commands

The README documents the following frontend commands, run from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Use the URL printed by Vite; the README gives `http://localhost:5173/` as the usual development URL.

Use package.json to discover available backend, build, lint, and test commands. Do not assume scripts exist. Use the repository’s lockfile and package manager conventions. Do not reinstall Tailwind or Supabase separately if they are already declared dependencies. Avoid dependency and lockfile changes unless the task needs them.

## Environment configuration

The README documents these frontend environment variables in `frontend/.env`:

```dotenv
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- Keep real credentials out of committed files, example values, logs, and responses.
- Vite exposes `VITE_` variables to browser code. Use them only for values intended to be public.
- Keep Supabase service-role credentials and Stripe, EasyPost, and Brevo secret keys on the server.
- Discover backend variable names from existing code or environment examples; do not invent them.
- Maintain placeholder-only environment examples when changing required configuration.

## Frontend conventions

- Match the existing JavaScript or TypeScript style, component structure, naming, and exports.
- Reuse existing Tailwind patterns and shared components.
- Include appropriate loading, empty, success, and error states for changed asynchronous flows.
- Preserve responsive layout, form labels, keyboard access, and existing navigation behavior.
- Follow the existing auth context and route-guard approach where present.
- Treat route guards as UI controls; enforce access to protected data and actions at the backend or database as appropriate.

## Backend and integrations

- Follow the current Express route, middleware, validation, and error-handling conventions.
- Validate incoming data and verify user identity and permissions for protected operations.
- Do not trust browser-supplied admin flags, prices, discounts, shipping charges, or order totals. Resolve authoritative values on the server.
- Keep payment, shipping, and email integration logic in the existing server modules.
- Preserve webhook signature verification and retry/idempotency behavior where implemented. When modifying webhook processing, check these requirements explicitly.
- Use mocks or provider test modes for verification. Do not charge real cards, buy postage, or send customer email as part of development checks.
- If changing uploads, inspect existing Multer limits, file validation, storage permissions, and error handling.
- Avoid logging secrets, payment details, or unnecessary customer data.

## Supabase and database changes

- Inspect the schema, migrations, relationships, and existing queries before changing database behavior.
- Preserve Row Level Security and verify that policies enforce the intended customer and admin access.
- Do not use broad access policies or disable RLS to work around authorization errors.
- Do not derive admin authority from client-editable data.
- Keep privileged Supabase clients server-side. Because elevated clients can bypass RLS, explicitly enforce authorization for requests that use them.
- Make required schema or policy changes through the repository’s existing migration workflow. Explain any manual application steps.
- Do not apply destructive migrations or change production records without explicit task authorization.

## Verification

The supplied README lists testing and deployment as placeholders. Inspect the repository for current tooling before choosing checks.

- Run relevant existing checks for the changed code using documented package scripts.
- Add or update focused tests when behavior changes and suitable test infrastructure exists.
- For UI changes, check the affected flow and relevant customer/admin access cases where practical.
- For checkout or shipping changes, verify failure and retry behavior in a test environment.
- If automated tests are unavailable, give concrete manual verification steps.
- Report exactly which checks ran and their results. State any checks blocked by missing configuration or services.

## Documentation and completion

- Update documentation when setup, required environment variables, commands, or user behavior changes.
- Do not present the README’s launch date, sprint dates, or placeholder sections as verified current status.
- Do not modify ownership, contributor, or license statements unless requested.
- Finish with a concise account of what changed, how it was verified, and any remaining limitations or manual steps.
