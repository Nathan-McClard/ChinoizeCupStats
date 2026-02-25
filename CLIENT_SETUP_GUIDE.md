# ChinoizeCup Stats — Client Setup Guide

This document walks you through the accounts and setup needed to own and run the ChinoizeCup Stats website. Once these accounts are created, your developer will handle all the technical configuration.

---

## What You Need to Create

You'll need to create **3 accounts**. Use an email you'll have long-term access to (a business email is ideal). Each account is free to start.

### 1. GitHub (Code Repository)

**What it does:** Stores all the website code. Any future developer can access it here.

- Go to [github.com](https://github.com) and sign up
- Once signed up, share your GitHub username with your developer so they can transfer the repository to your account

### 2. Supabase (Database)

**What it does:** Stores all your tournament data — results, standings, decklists, etc.

- Go to [supabase.com](https://supabase.com) and sign up (you can use "Sign in with GitHub" for convenience)
- Create a new project:
  - **Name:** ChinoizeCup Stats (or whatever you prefer)
  - **Region:** Choose the closest to your audience
  - **Password:** Save this somewhere secure — it's your database password
- Share your Supabase project URL and database password with your developer securely (password manager or in person — not over text/email)

### 3. Netlify (Website Hosting)

**What it does:** Hosts the live website and automatically deploys updates when code changes.

- Go to [netlify.com](https://www.netlify.com) and sign up (you can use "Sign in with GitHub" for convenience)
- Once signed up, share your Netlify account email with your developer so they can either:
  - Transfer the existing site to your account, or
  - Set up a new deployment connected to your GitHub repo

### 4. Domain (Optional)

If you want a custom domain (e.g., `chinoizecupstats.com`):

- Purchase one from [Cloudflare](https://www.cloudflare.com/products/registrar/), [Namecheap](https://www.namecheap.com), or [Google Domains](https://domains.google)
- Share the domain name with your developer — they'll configure the DNS settings

---

## What Your Developer Will Handle

Once you've created the accounts above, your developer will:

1. Transfer the code repository to your GitHub account
2. Set up the database tables and import existing data into your Supabase project
3. Connect your Netlify site to your GitHub repo for automatic deployments
4. Configure environment variables (API keys, database connection, etc.)
5. Set up the automated data sync (tournament results update automatically)
6. Connect your custom domain (if applicable)

---

## After Setup Is Complete

### What happens automatically
- Tournament data syncs on a schedule — no manual work needed
- Code pushes to GitHub automatically trigger a new deployment on Netlify

### What you own
- **GitHub** — the full source code
- **Supabase** — all tournament data
- **Netlify** — the live website and deployment pipeline
- **Domain** — your web address (if purchased)

### If you ever need a new developer
Everything they need is in the GitHub repository. Any web developer familiar with Next.js can:
1. Clone the repo from your GitHub
2. See the environment variables needed in the `.env.example` file
3. Access the database through your Supabase dashboard
4. Deploy through your Netlify dashboard

---

## Account Credentials Checklist

Use a password manager (like [Bitwarden](https://bitwarden.com) — free) to store these securely.

| Service   | What to Save                          |
|-----------|---------------------------------------|
| GitHub    | Email, password, 2FA recovery codes   |
| Supabase  | Email, password, database password    |
| Netlify   | Email, password                       |
| Domain    | Email, password, registrar login      |

---

## Monthly Costs

| Service  | Cost              |
|----------|-------------------|
| GitHub   | Free              |
| Supabase | Free (small projects) / ~$25/mo (Pro) |
| Netlify  | Free (small projects) / ~$19/mo (Pro) |
| Domain   | ~$10–15/year      |

---

*If you have any questions about this setup, don't hesitate to reach out to your developer.*
