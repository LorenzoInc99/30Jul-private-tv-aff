# Handover Guide - Football TV Guide

## 🎯 Project Summary

**Project:** Live Football on TV Guide  
**Purpose:** Comprehensive football match scheduling, TV broadcasting, and betting odds platform  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase  
**Status:** Active Development - UI/UX Phase Complete  

## 🚀 Quick Start Guide

### **For New Developers:**

#### **1. Environment Setup:**
```bash
# Clone repository
git clone [repository-url]
cd my-football-tv-guide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure Supabase URL and API keys

# Start development server
npm run dev
```

#### **2. Key Files to Understand First:**
- `src/app/layout.tsx` - Root layout and SEO configuration
- `src/app/page.tsx` - Homepage
- `src/app/match/[matchId]/page.tsx` - Match page entry point
- `src/app/match/[matchId]/MatchPageClient.tsx` - Main match page logic
- `src/lib/database-adapter.ts` - Database operations

#### **3. Project Structure:**
```
src/
├── app/                    # Next.js App Router pages
│   ├── match/[matchId]/    # Dynamic match pages
│   ├── team/[teamName]/    # Team pages
│   ├── competition/[slug]/ # League pages
│   └── bet-calculator/     # Betting calculator
├── components/             # Reusable UI components
├── lib/                    # Utility functions
└── contexts/               # React Context providers
```

## 🏗️ Architecture Overview

### **Core Components:**

#### **1. Match Page System:**
- **Entry Point:** `src/app/match/[matchId]/page.tsx`
- **Client Component:** `src/app/match/[matchId]/MatchPageClient.tsx`
- **Features:** Live scores, TV broadcasters, betting odds, team info

#### **2. Navigation System:**
- **Breadcrumb Component:** `src/components/Breadcrumb.tsx`
- **Usage:** Home > League > Match navigation
- **Implementation:** Reusable across all pages

#### **3. Broadcaster System:**
- **Component:** `src/components/BroadcasterRow.tsx`
- **Features:** TV channel display, affiliate links, filters
- **Revenue:** Commission from broadcaster referrals

#### **4. Betting Odds:**
- **Component:** `src/components/MatchOddsDisplay.tsx`
- **Features:** Best odds display, bookmaker links
- **Revenue:** Commission from betting referrals

## 💻 Development Guidelines

### **Code Standards:**
- **TypeScript:** All components use TypeScript for type safety
- **Tailwind CSS:** Utility-first CSS framework
- **Mobile-first:** Responsive design approach
- **SEO-friendly:** All pages optimized for search engines

### **Component Patterns:**
```typescript
// Example component structure
"use client";
import { useState, useEffect } from 'react';

interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX with Tailwind classes
  );
}
```

### **Styling Guidelines:**
- **Mobile-first:** Start with mobile styles, add desktop with `md:` prefix
- **Dark mode:** Use `dark:` prefix for dark theme styles
- **Responsive:** Use Tailwind's responsive breakpoints
- **Consistency:** Follow established design patterns

## 🔧 Key Development Areas

### **1. Match Page (`MatchPageClient.tsx`):**
- **Live match display** with score and time
- **Team information** with logos and form
- **TV broadcaster integration** with affiliate links
- **Betting odds display** with bookmaker links
- **SEO content sections** for search optimization

### **2. Database Integration (`database-adapter.ts`):**
- **Supabase client** configuration
- **Match data** fetching and processing
- **Team and league** information
- **Odds data** transformation and display

### **3. SEO Implementation:**
- **Dynamic meta tags** in page.tsx files
- **Structured data** in `lib/structuredData.ts`
- **XML sitemap** generation
- **Robots.txt** configuration

### **4. UI/UX Components:**
- **BroadcasterRow.tsx** - TV channel display with tooltips
- **Breadcrumb.tsx** - Navigation component
- **MatchOddsDisplay.tsx** - Betting odds display
- **BackToTopButton.tsx** - Scroll-to-top functionality

## 🎨 Design System

### **Color Scheme:**
- **Primary:** Indigo (`indigo-600`, `indigo-700`)
- **Secondary:** Gray (`gray-50`, `gray-900`)
- **Accent:** Yellow for highlights (`yellow-500`)
- **Status:** Red for live matches (`red-600`)

### **Typography:**
- **Fonts:** Inter, Poppins, JetBrains Mono
- **Sizes:** Responsive text sizing with Tailwind
- **Weights:** 300-900 range for different emphasis

### **Layout Patterns:**
- **Grid System:** CSS Grid for complex layouts
- **Flexbox:** For component alignment
- **Responsive:** Mobile-first breakpoints
- **Spacing:** Consistent padding and margins

## 🔍 SEO Strategy

### **Current Implementation:**
- **Dynamic meta tags** for all pages
- **Structured data** (Schema.org) markup
- **XML sitemap** with all pages
- **Mobile-friendly** design
- **Fast loading** with Next.js optimization

### **SEO Files:**
- `src/app/sitemap.ts` - XML sitemap generation
- `src/app/robots.ts` - Search engine directives
- `src/lib/structuredData.ts` - Schema markup
- `src/app/layout.tsx` - Global SEO configuration

## 💰 Revenue Model

### **Affiliate Revenue Streams:**
1. **TV Broadcaster Links** - Commission from streaming services
2. **Betting Odds Links** - Commission from bookmaker referrals
3. **Future:** Premium features and subscriptions

### **Implementation:**
- **Click tracking** for affiliate links
- **Mobile optimization** for higher conversion
- **SEO optimization** for organic traffic
- **User experience** for engagement

## 🚨 Critical Notes

### **Important Files to Never Break:**
1. `src/app/layout.tsx` - Global layout and SEO
2. `src/lib/database-adapter.ts` - Database operations
3. `src/components/Breadcrumb.tsx` - Navigation system
4. `src/lib/structuredData.ts` - SEO schema

### **Common Issues:**
- **Mobile responsiveness** - Always test on mobile devices
- **SEO meta tags** - Don't remove or break dynamic generation
- **Database queries** - Handle errors gracefully
- **Affiliate links** - Ensure proper tracking implementation

### **Development Workflow:**
1. **Start with:** Understanding the match page structure
2. **Test on:** Mobile devices first
3. **Check:** SEO meta tags are working
4. **Verify:** Database connections are stable
5. **Ensure:** Affiliate links are properly tracked

## 📞 Support & Resources

### **Documentation:**
- `PROJECT_OVERVIEW.md` - Complete project overview
- `DEVELOPMENT_LOG.md` - Development history and decisions
- `README.md` - Setup and installation guide

### **Key Dependencies:**
- **Next.js 14** - React framework
- **Supabase** - Database and authentication
- **Tailwind CSS** - Styling framework
- **TypeScript** - Type safety

### **Development Commands:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

---

**Last Updated:** September 27, 2025  
**Project Status:** Active Development  
**Next Phase:** API Integration & Real-time Data
