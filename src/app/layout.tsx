import type { Metadata } from 'next';
import './globals.css';
import { SITE_TITLE } from '../lib/constants';
import { generateOrganizationStructuredData, generateWebSiteStructuredData } from '../lib/structuredData';
import { supabaseServer } from '../lib/supabase';
import SidebarCompetitions from './components/SidebarCompetitions';
import MainLayoutClient from './components/MainLayoutClient';
import FooterNavClient from './components/FooterNavClient';
import MobileCompetitionsMenu from './components/MobileCompetitionsMenu';
import AdminWrapper from './components/AdminWrapper';
import BannerAd from '../components/BannerAd';
import ADVLeft from '../components/ADVLeft';
import ADVTop from '../components/ADVTop';
import ADVRight from '../components/ADVRight';
import NavigationWrapper from './components/NavigationWrapper';
import HeaderLogo from './components/HeaderLogo';

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
  let competitions = [];
  let error = null;
  
  try {
    const result = await supabase
      .from('leagues')
      .select('*')
      .order('name', { ascending: true });
    
    competitions = result.data || [];
    error = result.error;
  } catch (err) {
    console.warn('Failed to fetch competitions:', err);
    error = err;
  }

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
        <div className="md:mx-auto md:max-w-[1100px] md:px-8 md:rounded-2xl overflow-hidden">
          {/* Static Header/Nav Bar */}
          <header className="w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 flex items-center px-2 md:px-8">
            <div className="flex justify-between items-center w-full">
              <HeaderLogo />
              {/* Hamburger menu for mobile */}
              <div className="md:hidden">
                <MobileCompetitionsMenu competitions={competitions || []} />
              </div>
              {/* Navigation removed as per new requirements */}
            </div>
          </header>
          {/* Top horizontal banner ad (desktop only) */}
          <ADVTop />
          {/* Main layout below header and banner */}
          <AdminWrapper 
            competitions={competitions || []}
            header={null}
            footer={
              <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-12 py-8 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2 md:px-4">
                  {/* Live Football Today - Rich Content Section */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-base">Live Football Today</h3>
                    <p className="text-sm leading-relaxed mb-3">
                      Get the complete live football TV schedule for today with real-time updates. 
                      Watch Premier League, La Liga, Bundesliga, Serie A, Champions League, Europa League, 
                      and more live matches. Find where to watch football today with our comprehensive 
                      TV guide covering Sky Sports, BT Sport, Amazon Prime, BBC, ITV, and international 
                      broadcasters.
                    </p>
                    <p className="text-sm leading-relaxed">
                      Get live scores, match statistics, and the best betting odds from 
                      top bookmakers including bet365, William Hill, and Ladbrokes. Never miss a game 
                      with our up-to-date football schedule and TV listings.
                    </p>
                  </div>

                  {/* Football TV Guide & Streaming */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-base">Football TV Guide & Streaming</h3>
                    <p className="text-sm leading-relaxed mb-3">
                      Your complete guide to watching football on TV today. Find live streams, 
                      TV channels, and broadcast information for all major football leagues and competitions. 
                      Whether you're looking for Premier League live streams, Champions League coverage, 
                      or international football matches.
                    </p>
                    <p className="text-sm leading-relaxed">
                      We provide up-to-date TV schedules and streaming options. Compare betting odds 
                      from multiple bookmakers to get the best value on your football bets. 
                      Access comprehensive match previews and live score updates.
                    </p>
                  </div>

                  {/* Best Football Betting Odds */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-base">Best Football Betting Odds</h3>
                    <p className="text-sm leading-relaxed mb-3">
                      Compare the best football betting odds from leading bookmakers. Get real-time 
                      odds for match results, goals, cards, and more. Our odds comparison tool helps you 
                      find the best value bets across Premier League, Champions League, and international 
                      football matches.
                    </p>
                    <p className="text-sm leading-relaxed">
                      Track odds movements and get betting tips for today's football matches. 
                      Find the highest paying odds for home wins, away wins, draws, and special markets 
                      like both teams to score and over/under goals.
                    </p>
                  </div>

                  {/* Navigation & Links */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-base">Navigation</h3>
                    <ul className="space-y-2 mb-4">
                      <li><a href="/" className="hover:underline text-sm">Home</a></li>
                      <li><a href="/bet-calculator" className="hover:underline text-sm">Bet Calculator</a></li>
                      <li><a href="/sitemap.xml" className="hover:underline text-sm">Sitemap</a></li>
                      <li><a href="/about" className="hover:underline text-sm">About Us</a></li>
                      <li><a href="/contact" className="hover:underline text-sm">Contact</a></li>
                      <li><a href="/privacy-policy" className="hover:underline text-sm">Privacy Policy</a></li>
                      <li><a href="/terms-of-service" className="hover:underline text-sm">Terms of Service</a></li>
                    </ul>
                    
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white text-sm">Popular Leagues</h4>
                    <ul className="space-y-1">
                      {[
                        { id: 8, name: 'Premier League' },
                        { id: 564, name: 'La Liga' },
                        { id: 82, name: 'Bundesliga' },
                        { id: 384, name: 'Serie A' },
                        { id: 301, name: 'Ligue 1' }
                      ].map((league) => (
                        <li key={league.id}>
                          <a 
                            href={`/competition/${league.id}-${league.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                            className="hover:underline text-sm"
                          >
                            {league.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    © 2024 Live Football on TV. All rights reserved.
                  </p>
                </div>
              </footer>
            }
          >
            {children}
          </AdminWrapper>
        </div>
      </body>
    </html>
  );
}
