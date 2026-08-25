# VIT-AP Eats — Environment Variables

## Next.js App (`vitap-eats/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Cloudflare Worker (`backend/`)
Set these via `wrangler secret put` — never commit to git:
```
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_JWT_SECRET
```

For local dev, create `backend/.dev.vars`:
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
ENVIRONMENT=development
```

## How to get your Supabase credentials
1. Go to https://supabase.com → New Project
2. Settings → API → copy `Project URL` and `anon public` key (for frontend)
3. Settings → API → copy `service_role` key (for Worker only — keep secret!)
4. Settings → API → JWT Settings → copy `JWT Secret` (for Worker auth verification)
5. Run the migration: paste contents of `supabase/migrations/0001_initial_schema.sql` into the Supabase SQL Editor and execute it.
