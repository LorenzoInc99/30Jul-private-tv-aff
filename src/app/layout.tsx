import type { Metadata } from 'next';
import './globals.css';
import { SITE_TITLE } from '../lib/constants';
import { generateOrganizationStructuredData, generateWebSiteStructuredData } from '../lib/structuredData';
import { supabaseServer } from '../lib/supabase';
import SidebarCompetitions from './components/SidebarCompetitions';
import MainLayoutClient from './components/MainLayoutClient';
import FooterNavClient from './components/FooterNavClient';
import MobileCompetitionsMenu from './components/MobileCompetitionsMenu';
import BannerAd from '../components/BannerAd';
import ADVLeft from '../components/ADVLeft';
import ADVTop from '../components/ADVTop';
import ADVRight from '../components/ADVRight';

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`
  },
  description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!',
  keywords: 'live football, football on tv, soccer schedule, football fixtures, live matches, football broadcasters, betting odds, football today, soccer tv guide',
  authors: [{ name: 'Sports TV Guide' }],
  creator: 'Sports TV Guide',
  publisher: 'Sports TV Guide',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com', // Replace with your actual domain
    title: SITE_TITLE,
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!',
    siteName: SITE_TITLE,
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'Live Football TV Guide - Complete match schedules and betting odds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!',
    images: ['/og-image.jpg'], // Same as Open Graph image
    creator: '@yourtwitterhandle', // Replace with your Twitter handle
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
    yandex: 'your-yandex-verification-code', // Optional
    yahoo: 'your-yahoo-verification-code', // Optional
  },
  category: 'sports',
  classification: 'football, soccer, sports, betting, tv guide',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebSiteStructuredData();

  // Fetch all competitions for sidebar
  const supabase = supabaseServer();
  const { data: competitions, error } = await supabase
    .from('leagues')
    .select('*')
    .order('name', { ascending: true });

  console.log('Layout Debug - Database query result:', {
    competitionsCount: competitions?.length || 0,
    competitions: competitions,
    error: error
  });

  // Get current path for aria-current
  // This must be done in a client component, so move the footer nav to a new FooterNavClient component
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://your-domain.com" />
        {/* Open Graph and Twitter meta tags */}
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content="Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content="Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds. Never miss a game!" />
        <meta name="twitter:image" content="/og-image.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300">
        {/* Left vertical banner ad (desktop only) */}
        <ADVLeft />
        {/* Right vertical banner ad (desktop only) */}
        <ADVRight />
        {/* Top horizontal banner ad (desktop only) */}
        <ADVTop />
        <div className="md:mx-auto md:max-w-[1100px] md:px-8 md:rounded-2xl overflow-hidden">
          {/* Static Header/Nav Bar */}
          <header className="w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 flex items-center px-2 md:px-8">
            <div className="flex justify-between items-center w-full">
              <a href="/" className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight no-underline hover:text-blue-600 dark:hover:text-blue-400">
                Live Football TV Guide
              </a>
              {/* Hamburger menu for mobile */}
              <div className="md:hidden">
                <MobileCompetitionsMenu competitions={competitions || []} />
              </div>
              {/* Navigation removed as per new requirements */}
            </div>
          </header>
          {/* Main layout below header and banner */}
          <MainLayoutClient competitions={competitions || []}>
            {children}
          </MainLayoutClient>
          {/* SEO-optimized Footer */}
          <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12 py-8 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 px-2 md:px-4">
              {/* Main Navigation */}
              <FooterNavClient />
              {/* Popular Competitions */}
              <nav aria-label="Popular competitions">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Popular Leagues</h3>
                <ul className="space-y-1">
                  {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League'].map((league) => {
                    const comp = (competitions || []).find((c: { id: number|string; name: string }) => c.name.toLowerCase() === league.toLowerCase());
                    if (!comp) return null;
                    const slug = `${comp.id}-${comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
                    return (
                      <li key={comp.id}>
                        <a href={`/competition/${slug}`} className="hover:underline">{comp.name}</a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              {/* About & Legal */}
              <nav aria-label="About and legal">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">About</h3>
                <ul className="space-y-1">
                  <li><a href="/about" className="hover:underline">About Us</a></li>
                  <li><a href="/contact" className="hover:underline">Contact</a></li>
                  <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
                  <li><a href="/terms-of-service" className="hover:underline">Terms of Service</a></li>
                </ul>
              </nav>
              {/* Social or Call to Action */}
              <div>
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Follow Us</h3>
                <ul className="space-y-1">
                  <li><a href="https://twitter.com/yourhandle" target="_blank" rel="noopener" className="hover:underline">Twitter</a></li>
                  <li><a href="https://facebook.com/yourpage" target="_blank" rel="noopener" className="hover:underline">Facebook</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-8 text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Live Football TV Guide. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
