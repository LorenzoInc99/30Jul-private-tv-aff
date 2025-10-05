// Performance monitoring utilities
export class PerformanceMonitor {
  static trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined') {
      const loadTime = performance.now();
      console.log(`Page ${pageName} loaded in ${loadTime}ms`);
      
      // Send to analytics if available
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          event_category: 'Performance',
          event_label: pageName,
          value: Math.round(loadTime),
        });
      }
    }
  }
  
  static trackApiCall(endpoint: string, duration: number) {
    console.log(`API ${endpoint} took ${duration}ms`);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_call_duration', {
        event_category: 'Performance',
        event_label: endpoint,
        value: Math.round(duration),
      });
    }
  }
  
  static trackDatabaseQuery(queryName: string, duration: number) {
    console.log(`Database query ${queryName} took ${duration}ms`);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'database_query_duration', {
        event_category: 'Performance',
        event_label: queryName,
        value: Math.round(duration),
      });
    }
  }
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
}

// Database query performance wrapper
export async function withPerformanceTracking<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    
    PerformanceMonitor.trackDatabaseQuery(queryName, duration);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`Database query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}
