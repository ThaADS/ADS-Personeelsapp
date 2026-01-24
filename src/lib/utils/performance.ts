/**
 * Performance Utilities
 * Tools for monitoring and optimizing application performance
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("Performance");

// Interface voor performance metrics
export interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  resourceLoadTimes: Record<string, number>;
  memoryUsage?: MemoryInfo;
}

// Interface voor geheugengebruik
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/**
 * Verzamelt Web Vitals metrics
 * @returns Promise met performance metrics
 */
export async function collectPerformanceMetrics(): Promise<Partial<PerformanceMetrics>> {
  return new Promise((resolve) => {
    // Wacht tot de pagina volledig geladen is
    if (document.readyState === 'complete') {
      gatherMetrics();
    } else {
      window.addEventListener('load', () => {
        // Geef de browser tijd om metrics te berekenen
        setTimeout(gatherMetrics, 1000);
      });
    }

    function gatherMetrics() {
      const metrics: Partial<PerformanceMetrics> = {};
      
      // Performance entries ophalen
      const entries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (entries) {
        metrics.timeToFirstByte = entries.responseStart - entries.requestStart;
      }
      
      // Resource timing data verzamelen
      const resourceEntries = performance.getEntriesByType('resource');
      const resourceLoadTimes: Record<string, number> = {};
      
      resourceEntries.forEach((entry) => {
        const url = entry.name.split('/').pop() || entry.name;
        resourceLoadTimes[url] = entry.duration;
      });
      
      metrics.resourceLoadTimes = resourceLoadTimes;
      
      // Geheugengebruik ophalen indien beschikbaar (Chrome-specific)
      const perfWithMemory = performance as Performance & {
        memory?: {
          jsHeapSizeLimit: number;
          totalJSHeapSize: number;
          usedJSHeapSize: number;
        };
      };
      if (perfWithMemory.memory) {
        metrics.memoryUsage = {
          jsHeapSizeLimit: perfWithMemory.memory.jsHeapSizeLimit,
          totalJSHeapSize: perfWithMemory.memory.totalJSHeapSize,
          usedJSHeapSize: perfWithMemory.memory.usedJSHeapSize
        };
      }
      
      // Web Vitals metrics ophalen via PerformanceObserver API
      // Deze worden asynchroon verzameld en later toegevoegd
      
      resolve(metrics);
    }
  });
}

/**
 * Registreert een PerformanceObserver voor Web Vitals metrics
 * @param callback Functie die wordt aangeroepen wanneer metrics beschikbaar zijn
 */
export function observeWebVitals(
  callback: (metric: {name: string; value: number}) => void
): void {
  try {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback({
        name: 'LCP',
        value: lastEntry.startTime
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const firstInput = entry as PerformanceEventTiming;
        callback({
          name: 'FID',
          value: firstInput.processingStart - firstInput.startTime
        });
      });
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // LayoutShift entries have a 'value' property
        const layoutEntry = entry as PerformanceEntry & { value?: number };
        if (layoutEntry.value !== undefined) {
          callback({
            name: 'CLS',
            value: layoutEntry.value
          });
        }
      });
    }).observe({ type: 'layout-shift', buffered: true });

  } catch (error) {
    logger.error('PerformanceObserver niet ondersteund', error);
  }
}

/**
 * Optimaliseert afbeeldingen voor verschillende schermformaten
 * @param src Originele afbeelding URL
 * @param width Gewenste breedte
 * @param quality Kwaliteit (1-100)
 * @returns Geoptimaliseerde afbeelding URL
 */
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 75
): string {
  // Controleer of de URL al een CDN URL is
  if (src.includes('imagedelivery.net') || src.includes('imagecdn.app')) {
    return src;
  }
  
  // Voeg query parameters toe voor on-the-fly optimalisatie
  // In een echte implementatie zou dit een image optimization service gebruiken
  const url = new URL(src, window.location.origin);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
}

/**
 * Implementeert code splitting voor dynamische imports
 * @param modulePath Pad naar de module
 * @returns Promise met de geïmporteerde module
 */
export function lazyImport<T>(modulePath: string): Promise<T> {
  return import(/* webpackChunkName: "[request]" */ `${modulePath}`)
    .then(module => module.default || module)
    .catch(error => {
      logger.error('Fout bij laden van module', error, { modulePath });
      throw error;
    });
}

/**
 * Implementeert debounce functie voor performance optimalisatie
 * @param func Functie om te debounce
 * @param wait Wachttijd in ms
 * @returns Gedebounced functie
 */
export function debounce<T extends (...args: (string | number | boolean)[]) => (string | number | boolean)>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Implementeert throttle functie voor performance optimalisatie
 * @param func Functie om te throttle
 * @param limit Limiet in ms
 * @returns Gethrottled functie
 */
export function throttle<T extends (...args: (string | number | boolean)[]) => (string | number | boolean)>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
