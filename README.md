# My Football TV Guide

sf "add contact page"
# ...make your changes...
ff   # to finish and merge
# or
df   # to discard





A modern, SEO-optimized football TV guide built with Next.js 15 and Supabase. This project helps users find live football matches, see where to watch them on TV, and compare the best betting odds—all in one place.

## Project Overview

- **Live Football TV Schedule:** See all live and upcoming football matches, grouped by competition and date.
- **Where to Watch:** Instantly see which TV channels or streaming services are broadcasting each match.
- **Best Odds Comparison:** View and compare the best betting odds for each match from multiple bookmakers.
- **Team & Competition Pages:** Dedicated pages for every team and competition, with match lists and SEO metadata.
- **SEO-Optimized:** Dynamic metadata, Open Graph, Twitter Cards, structured data (JSON-LD), sitemap, and robots.txt.
- **Mobile-First & Minimalist:** Clean, responsive design for fast loading and easy navigation.
- **Supabase Backend:** All data (matches, teams, competitions, odds, broadcasters) is managed in Supabase.
- **Modern Next.js 15:** Uses the App Router, server components, and best practices for performance and maintainability.

## Features Implemented

- Dynamic routing for matches, teams, and competitions
- Grouped match schedules by competition and date
- Odds comparison table for each match
- TV/broadcaster info for every match
- SEO: unique titles, meta descriptions, Open Graph, Twitter Cards, robots.txt, sitemap
- Structured data: events, breadcrumbs, organization, website
- Navigation: homepage, competitions, teams, match details, team/competition details
- Minimalist, mobile-friendly UI
- GitHub version control and deployment-ready

## Tech Stack
- **Frontend:** Next.js 15 (App Router, SSR, SSG, API routes)
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Styling:** Tailwind CSS
- **SEO:** Dynamic metadata, structured data, sitemap, robots.txt
- **Version Control:** Git + GitHub

## How to Run Locally

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/LorenzoInc99/my-football-tv-guide.git
   cd my-football-tv-guide
   npm install
   ```
2. Add your `.env.local` with Supabase keys (see `.env.example` if available).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## How to Contribute / Continue Development
- Make your changes locally in Cursor or VS Code
- Commit and push to GitHub:
  ```bash
  git add .
  git commit -m "Describe your change"
  git push
  ```
- Keep this README up to date with new features or changes

## Project History / What Has Been Done
- Initial setup with Next.js 15 and Supabase
- Dynamic routes for matches, teams, competitions
- SEO enhancements: metadata, Open Graph, Twitter, robots.txt, sitemap
- Minimalist UI and navigation
- Odds and broadcaster integration
- GitHub backup and workflow documentation

---
