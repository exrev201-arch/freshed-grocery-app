/**
 * Performance Testing Utilities for Fresh App
 * Provides performance monitoring, testing, and optimization helpers
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  lastRender: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private readonly maxMetrics = 1000;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>, userId?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      userId,
      metadata
    };

    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.pop();
    }

    console.log(`Performance Metric - ${name}: ${value}ms`, metadata);
  }

  /**
   * Record component render performance
   */
  recordComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = renderTime;
      existing.rerenderCount++;
      existing.lastRender = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        rerenderCount: 1,
        lastRender: Date.now()
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    averageMetrics: Record<string, number>;
    componentStats: ComponentPerformance[];
    recentMetrics: PerformanceMetric[];
  } {
    // Calculate average metrics by name
    const metricGroups: Record<string, number[]> = {};
    
    this.metrics.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = [];
      }
      metricGroups[metric.name].push(metric.value);
    });

    const averageMetrics: Record<string, number> = {};
    Object.entries(metricGroups).forEach(([name, values]) => {
      averageMetrics[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return {
      averageMetrics,
      componentStats: Array.from(this.componentMetrics.values()),
      recentMetrics: this.metrics.slice(0, 50)
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * React hook for performance monitoring
 */
import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitor.recordComponentRender(componentName, renderTime);
  });

  const measureOperation = (operationName: string, operation: () => Promise<void> | void) => {
    return async () => {
      const startTime = performance.now();
      
      try {
        if (operation.constructor.name === 'AsyncFunction') {
          await (operation as () => Promise<void>)();
        } else {
          (operation as () => void)();
        }
      } finally {
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric(`${componentName}_${operationName}`, duration);
      }
    };
  };

  return { measureOperation };
};

/**
 * Utility functions for specific performance measurements
 */

// Measure API call performance
export const measureApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>,
  userId?: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(`api_${apiName}`, duration, {
      status: 'success'
    }, userId);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(`api_${apiName}`, duration, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, userId);
    
    throw error;
  }
};

// Measure cart operations
export const measureCartOperation = (operation: string, fn: () => void, userId?: string) => {
  const startTime = performance.now();
  
  try {
    fn();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(`cart_${operation}`, duration, {
      status: 'success'
    }, userId);
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(`cart_${operation}`, duration, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, userId);
    
    throw error;
  }
};

// Measure product loading performance
export const measureProductLoad = async (
  productCount: number,
  loadFunction: () => Promise<void>,
  userId?: string
): Promise<void> => {
  const startTime = performance.now();
  
  try {
    await loadFunction();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric('product_load', duration, {
      productCount,
      status: 'success'
    }, userId);
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric('product_load', duration, {
      productCount,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, userId);
    
    throw error;
  }
};

// Performance thresholds for alerts
export const PERFORMANCE_THRESHOLDS = {
  API_CALL_SLOW: 3000, // 3 seconds
  COMPONENT_RENDER_SLOW: 16, // 16ms (60fps)
  PRODUCT_LOAD_SLOW: 5000, // 5 seconds
  CART_OPERATION_SLOW: 100, // 100ms
  IMAGE_LOAD_SLOW: 2000 // 2 seconds
};

// Check if performance is within acceptable limits
export const checkPerformanceAlert = (metricName: string, value: number): boolean => {
  switch (metricName) {
    case 'api_call':
      return value > PERFORMANCE_THRESHOLDS.API_CALL_SLOW;
    case 'component_render':
      return value > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER_SLOW;
    case 'product_load':
      return value > PERFORMANCE_THRESHOLDS.PRODUCT_LOAD_SLOW;
    case 'cart_operation':
      return value > PERFORMANCE_THRESHOLDS.CART_OPERATION_SLOW;
    case 'image_load':
      return value > PERFORMANCE_THRESHOLDS.IMAGE_LOAD_SLOW;
    default:
      return false;
  }
};

// Generate performance report
export const generatePerformanceReport = (): string => {
  const stats = performanceMonitor.getStats();
  
  let report = '=== Fresh App Performance Report ===\n\n';
  
  report += 'Average Metrics:\n';
  Object.entries(stats.averageMetrics).forEach(([name, average]) => {
    const isAlert = checkPerformanceAlert(name, average);
    const alertIcon = isAlert ? '⚠️ ' : '✅ ';
    report += `${alertIcon}${name}: ${average.toFixed(2)}ms\n`;
  });
  
  report += '\nComponent Performance:\n';
  stats.componentStats
    .sort((a, b) => b.renderTime - a.renderTime)
    .slice(0, 10)
    .forEach(comp => {
      const isAlert = checkPerformanceAlert('component_render', comp.renderTime);
      const alertIcon = isAlert ? '⚠️ ' : '✅ ';
      report += `${alertIcon}${comp.componentName}: ${comp.renderTime.toFixed(2)}ms (${comp.rerenderCount} renders)\n`;
    });
  
  report += '\nRecent Slow Operations:\n';
  stats.recentMetrics
    .filter(metric => checkPerformanceAlert(metric.name, metric.value))
    .slice(0, 5)
    .forEach(metric => {
      report += `⚠️ ${metric.name}: ${metric.value.toFixed(2)}ms at ${new Date(metric.timestamp).toLocaleTimeString()}\n`;
    });
  
  return report;
};