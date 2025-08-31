import { SITE_TITLE } from './constants';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  const itemListElements = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemListElements,
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_TITLE,
    url: 'https://your-domain.com', // Replace with your actual domain
    logo: 'https://your-domain.com/logo.png', // Replace with your actual logo
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds.',
    sameAs: [
      'https://twitter.com/yourtwitterhandle', // Replace with your social media URLs
      'https://facebook.com/yourfacebookpage',
      'https://instagram.com/yourinstagram',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@your-domain.com', // Replace with your email
    },
  };
}

export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_TITLE,
    url: 'https://your-domain.com', // Replace with your actual domain
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://your-domain.com/search?q={search_term_string}', // Replace with your search URL
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_TITLE,
    description: 'Find the complete live football TV schedule for today, including broadcasters, kick-off times, and real-time betting odds.',
    url: 'https://your-domain.com', // Replace with your actual domain
    telephone: '+1-555-123-4567', // Replace with your phone number
    email: 'contact@your-domain.com', // Replace with your email
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main St', // Replace with your address
      addressLocality: 'City',
      addressRegion: 'State',
      postalCode: '12345',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128, // Replace with your coordinates
      longitude: -74.0060,
    },
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: 'Free',
  };
}

export function generateBetCalculatorStructuredData(betType: string = 'General') {
  const calculatorName = betType === 'General' 
    ? 'Free Bet Calculator - Football Betting Calculator & Odds Calculator'
    : `${betType} Bet Calculator`;

  const calculatorDescription = betType === 'General'
    ? 'Free football betting calculator. Calculate returns for singles, doubles, trebles, accumulators, and more. Get accurate odds calculations for all bet types.'
    : `Free ${betType.toLowerCase()} bet calculator for football betting. Calculate returns for ${betType.toLowerCase()} bets instantly.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calculatorName,
    description: calculatorDescription,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    featureList: [
      'Free to use',
      'No registration required',
      'Instant calculations',
      'Multiple bet types supported',
      'Football betting focused',
      'Mobile responsive'
    ],
    screenshot: 'https://your-domain.com/bet-calculator-screenshot.png', // Replace with actual screenshot URL
    softwareVersion: '1.0',
    author: {
      '@type': 'Organization',
      name: SITE_TITLE
    }
  };
} 