# 69HUB (static demo)

## Upload to GitHub
1. Create a free account at github.com, click **New repository**, name it (e.g. `69hub`), keep it **Public**, click **Create**.
2. Click **uploading an existing file**, drag in `index.html`, `style.css`, `script.js`, then **Commit changes**.
   (Files must sit in the repository root, not inside a folder.)

## Enable GitHub Pages
Repository **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save.**
After about a minute your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Works without a backend (in memory, resets on reload)
Search, category filter, sort, load more, video player (play, seek, volume, speed, full screen, error message),
mobile menu, report/removal forms (UI only), creator form with simulated upload and "Pending Review" status,
admin approve/reject/remove/category management (UI only, no real security).

## Needs extra services for the real thing
- Accounts and secure login: Supabase Auth, Firebase Auth, or Auth0 (never store passwords in the frontend).
- Database for videos, reports, categories: Supabase/Postgres or Firebase.
- Video storage, transcoding and delivery: Cloudflare Stream, Mux, or S3 + CDN.
- Server-side admin roles and moderation, abuse reporting, age/consent checks, legal review of policies.
Swap the `api` object in `script.js` for real network calls when you add a backend.
