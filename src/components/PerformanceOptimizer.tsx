'use client';

import { useEffect } from 'react';
import { 
  optimizeReactRendering, 
  optimizeCriticalPath, 
  cleanupMemory,
  lazyLoadImages,
  optimizeBundleSize
} from '../lib/performance-optimizations';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Run performance optimizations on client side
    optimizeReactRendering();
    optimizeCriticalPath();
    cleanupMemory();
    lazyLoadImages();
    optimizeBundleSize();
  }, []);

  return null; // This component doesn't render anything
}
