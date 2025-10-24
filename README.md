
# GitMatch 🤝

**Connect. Collaborate. Code.** Find active developers looking for partners to learn, build, or solve problems with.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-gitmatch.shop-blue?style=for-the-badge&logo=vercel)](https://www.gitmatch.shop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## The Problem

Finding a coding partner on Reddit or Discord often means wading through noise, contacting inactive users from old posts, and struggling to find someone with matching goals, skills, *and* availability. It's inefficient and frustrating.

---

## Why GitMatch? ✨

GitMatch cuts through the noise with a focused approach:

* **Always Fresh:** Goal Cards **auto-expire after 14 days**. No more contacting stale posts. Users get a simple reminder with a secure link to keep their card active if needed.
* **High-Signal Posts:** Structured "Goal Cards" require key details (Tech, Skill, Goal, Vibe, Timezone, Availability), so you know if it's a potential match *before* reaching out.
* **Instant Matching:** Post your own goal and immediately see the top 5 relevant matches based on your criteria.
* **Secure Contact:** Browse freely. Contact details are hidden behind CAPTCHA, preventing spam and protecting user privacy.
* **Zero Distraction:** No feeds, no forums. Just a clean utility to find and connect with partners.
* **Own Your Posts:** Easily log in (Email/Pass, Google, GitHub) to edit or delete your active cards.

---

## Live Site

Check it out: **[https://www.gitmatch.shop](https://www.gitmatch.shop)**



---

## Tech Stack

* **Framework:** Next.js (App Router) / React
* **Styling:** Tailwind CSS
* **Database:** Supabase (PostgreSQL)
* **Auth:** Supabase Auth
* **Backend:** Supabase Edge Functions, Next.js Server Actions & API Routes
* **Email:** Resend
* **CAPTCHA:** Cloudflare Turnstile
* **Deployment:** Vercel

---

## Running Locally

### Prerequisites

* Node.js (v18+) & npm
* Deno
* Supabase Account & CLI
* Cloudflare Account
* Resend Account & Verified Domain

### Setup

1.  **Clone:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/gitmatch.git](https://github.com/YOUR_GITHUB_USERNAME/gitmatch.git)
    cd gitmatch
    ```
2.  **Install Deps:**
    ```bash
    npm install
    ```
3.  **Supabase Setup:**
    * Create Supabase project.
    * Run SQL to create `cards` and `relist_tokens` tables (see `schema.sql` if provided, or manually add columns as per project steps). Add the foreign key.
    * Enable `pg_cron` extension.
    * Set up RLS policies (Public Read, Auth Insert/Update/Delete).
    * Create & schedule `delete_old_cards` SQL function.
    * Add `RESEND_API_KEY` to Supabase Secrets.
    * Deploy `send-expiry-reminders` Edge Function (via Editor or CLI) & schedule via SQL Editor (`net.http_post`).
4.  **Cloudflare/Resend:**
    * Set up Turnstile site (note Site/Secret Keys).
    * Verify your domain with Resend (note API Key).
5.  **Environment Variables:**
    * Copy `.env.example` to `.env.local`.
    * Fill in all required values (Supabase keys, CF keys, OAuth keys if needed, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).
6.  **Run Dev Server:**
    ```bash
    npm run dev
    ```

---

## Environment Variables (`.env.example`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_PUBLIC_KEY>
NEXT_PUBLIC_SUPABASE_PROJECT_REF=<YOUR_PROJECT_REF>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY> # For backend use ONLY

# Cloudflare Turnstile
NEXT_PUBLIC_CLOUDFLARE_TURNSILE_SITE_KEY=<YOUR_CF_SITE_KEY>
CLOUDFLARE_TURNSILE_SECRET_KEY=<YOUR_CF_SECRET_KEY> # For backend use ONLY

# Resend (Set in Supabase Secrets for Edge Function)
# RESEND_API_KEY=<YOUR_RESEND_API_KEY>

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Use [https://www.gitmatch.shop](https://www.gitmatch.shop) for production

# Optional: OAuth Providers (Needed if testing OAuth locally)
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
````

**Important:** Add `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDFLARE_TURNSILE_SECRET_KEY` to your Vercel deployment environment variables. Ensure `RESEND_API_KEY` is set in Supabase Function Secrets.

-----

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request\!

-----

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

