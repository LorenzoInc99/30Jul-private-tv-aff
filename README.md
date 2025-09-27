# Live Football on TV Guide

A comprehensive football match scheduling, TV broadcasting, and betting odds platform built with Next.js 14, TypeScript, and Supabase.

## 🎯 Project Overview

**Purpose:** Provide football fans with complete match information, TV broadcasting details, and betting odds comparison.  
**Revenue Model:** Affiliate marketing through TV broadcaster and betting odds referrals.  
**Target Audience:** Football fans, bettors, and sports enthusiasts worldwide.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd my-football-tv-guide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment variables:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── match/[matchId]/          # Dynamic match pages
│   ├── team/[teamName]/          # Team detail pages
│   ├── competition/[slug]/       # League/competition pages
│   ├── bet-calculator/           # Betting calculator tools
│   └── api/                      # API routes
├── components/                   # Reusable UI components
│   ├── MatchCard.tsx            # Match display component
│   ├── BroadcasterRow.tsx       # TV broadcaster display
│   ├── BetCalculator.tsx         # Betting calculator
│   └── Breadcrumb.tsx           # Navigation component
├── lib/                         # Utility functions
│   ├── database-adapter.ts      # Database operations
│   ├── structuredData.ts        # SEO schema
│   └── utils.ts                 # Helper functions
└── contexts/                    # React Context providers
    ├── SidebarContext.tsx       # Sidebar state
    └── TeamContext.tsx          # Team data context
```

## ✨ Key Features

### **Match Information**
- Live match scores and status
- Team information with logos and form
- Match date, time, and venue details
- Real-time updates for live matches

### **TV Broadcasting**
- Where to watch matches
- TV channel information
- Streaming service links
- Geographic availability

### **Betting Odds**
- Best odds comparison
- Multiple bookmaker options
- Real-time odds updates
- Betting calculator tools

### **SEO Optimized**
- Dynamic meta tags
- Structured data markup
- XML sitemap generation
- Mobile-friendly design

## 🎨 UI/UX Features

### **Modern Design**
- Mobile-first responsive design
- Dark/light theme support
- Smooth animations and transitions
- Intuitive navigation

### **User Experience**
- Breadcrumb navigation
- Interactive tooltips
- Filter system for broadcasters
- Back-to-top functionality

### **Performance**
- Next.js optimization
- Image optimization
- Fast loading times
- SEO-friendly structure

## 💰 Revenue Model

### **Affiliate Marketing**
- TV broadcaster commission
- Betting odds referral fees
- Premium feature subscriptions (future)

### **Optimization**
- Mobile-first design for higher conversion
- SEO optimization for organic traffic
- User engagement features
- Click tracking for affiliate links

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Key Development Files**
- `src/app/match/[matchId]/MatchPageClient.tsx` - Main match page
- `src/components/BroadcasterRow.tsx` - TV broadcaster display
- `src/lib/database-adapter.ts` - Database operations
- `src/lib/structuredData.ts` - SEO schema

## 📊 SEO Implementation

### **Technical SEO**
- Dynamic meta tags for all pages
- Structured data (Schema.org) markup
- XML sitemap with all pages
- Robots.txt configuration
- Canonical URLs

### **Content SEO**
- Keyword-optimized page titles
- Rich meta descriptions
- Internal linking structure
- Mobile-friendly design

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

- `PROJECT_OVERVIEW.md` - Complete project overview
- `DEVELOPMENT_LOG.md` - Development history and decisions
- `HANDOVER_GUIDE.md` - Guide for new developers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For questions or support, please contact the development team.

---

**Last Updated:** September 27, 2025
**Version:** 1.0.0  
**Status:** Active Development