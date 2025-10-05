// Performance optimizations to reduce Total Blocking Time (TBT)

// 1. Debounce heavy operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 2. Throttle expensive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 3. Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]) {
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// 4. Lazy load images
export function lazyLoadImages() {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// 5. Optimize database queries
export function optimizeDatabaseQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  ttl: number = 300000 // 5 minutes
): Promise<T> {
  // Simple in-memory cache
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return new Promise(async (resolve, reject) => {
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      resolve(cached.data);
      return;
    }
    
    try {
      const data = await queryFn();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

// 6. Reduce main thread work
export function deferHeavyWork<T>(work: () => T): Promise<T> {
  return new Promise((resolve) => {
    // Use setTimeout to defer work to next tick
    setTimeout(() => {
      const result = work();
      resolve(result);
    }, 0);
  });
}

// 7. Optimize React rendering
export function optimizeReactRendering() {
  if (typeof window === 'undefined') return;
  
  // Reduce React DevTools overhead in production
  if (process.env.NODE_ENV === 'production') {
    // Disable React DevTools in production
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
    }
  }
}

// 8. Memory management
export function cleanupMemory() {
  if (typeof window === 'undefined') return;
  
  // Clear unused event listeners
  const cleanup = () => {
    // Remove unused event listeners
    document.removeEventListener('scroll', () => {});
    document.removeEventListener('resize', () => {});
  };
  
  // Run cleanup periodically
  setInterval(cleanup, 30000); // Every 30 seconds
}

// 9. Critical path optimization
export function optimizeCriticalPath() {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
  const criticalResources = [
    '/fonts/inter.woff2',
    '/images/logo.svg'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.woff2') ? 'font' : 'image';
    document.head.appendChild(link);
  });
}

// 10. Bundle size optimization
export function optimizeBundleSize() {
  if (typeof window === 'undefined') return;
  
  // Remove unused CSS
  const unusedCSS = document.querySelectorAll('style[data-unused]');
  unusedCSS.forEach(style => style.remove());
  
  // Remove unused JavaScript
  const unusedScripts = document.querySelectorAll('script[data-unused]');
  unusedScripts.forEach(script => script.remove());
}
