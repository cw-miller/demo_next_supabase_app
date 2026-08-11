# demo_next_supabase_app

A polished Next.js + Supabase starter app with authentication, blog post management, admin controls, and Drizzle ORM.

## What this app includes

- Next.js App Router with server and client components
- Supabase auth configured for SSR using `@supabase/ssr`
- Email/password login flows and protected routes
- Drizzle ORM for PostgreSQL schema and queries
- A public blog feed plus user dashboards and admin panel
- Tailwind CSS with shadcn-style UI components
- `next.config.ts` optimized for component caching

## Key pages

- `/` — public blog listing
- `/auth/login` — login page
- `/dashboard` — authenticated user dashboard
- `/dashboard/new` — create a new post
- `/dashboard/edit/[id]` — edit a post
- `/admin` — admin panel for posts and user roles
- `/protected` — authenticated-only info page

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a Supabase project

Use the Supabase dashboard to create a new project.

3. Configure environment variables

Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# or use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for publishable key support
```

4. Run local development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Database commands

This project uses Drizzle ORM and Drizzle Kit for schema management.

- `npm run db:push` — push schema changes to the database
- `npm run db:generate` — generate Drizzle ORM database types
- `npm run db:migrate` — run migrations
- `npm run db:seed-admin` — seed initial admin user data

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build the app for production
- `npm run start` — start the production server
- `npm run lint` — run ESLint checks

## Environment variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Notes

- The app creates Supabase clients in both browser and server contexts.
- Server-side auth uses cookie-aware Supabase client creation in `lib/supabase/server.ts`.
- `lib/auth-helpers.ts` contains helpers for current user lookup and role enforcement.
- `app/admin/page.tsx` protects the admin view and allows role updates.

## Recommended workflow

1. Start Supabase and configure env vars
2. Run `npm run dev`
3. Sign up or log in at `/auth/login`
4. Create posts from `/dashboard`
5. Publish posts and manage roles from `/admin`

## Project structure

- `app/` — Next.js routes, protected pages, auth flows
- `components/` — UI controls, forms, navigation, tutorial steps
- `lib/supabase/` — Supabase client creation for browser/server
- `src/db/` — Drizzle ORM setup and schema
- `src/app/actions/` — server actions for blog CRUD operations

## License

This repository is provided as-is for demo and starter use.
