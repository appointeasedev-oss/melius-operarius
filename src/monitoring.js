/**
 * Monitoring and Observability Module for Melius Operarius
 * Provides metrics, health checks, and performance monitoring
 */

const os = require('os');
const { execSync } = require('child_process');

class MonitoringService {
  constructor(config = {}) {
    this.config = {
      collectMetrics: true,
      logPerformance: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsRetention: 86400000, // 24 hours in milliseconds
      ...config
    };
    
    this.metrics = {
      requests: [],
      performance: [],
      errors: [],
      system: []
    };
    
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    
    if (this.config.collectMetrics) {
      this.startCollecting();
    }
  }

  /**
   * Start collecting system metrics
   */
  startCollecting() {
    // Collect system metrics periodically
    setInterval(() => {
      if (this.config.collectMetrics) {
        this.collectSystemMetrics();
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Collect system-level metrics
   */
  collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: this.getCpuUsage(),
      uptime: process.uptime(),
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length,
      osInfo: {
        platform: os.platform(),
        arch: os.arch(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        loadavg: os.loadavg(),
        cpus: os.cpus().length
      }
    };

    this.metrics.system.push(metrics);

    // Maintain retention policy
    this.enforceRetentionPolicy('system');
  }

  /**
   * Get CPU usage percentage
   */
  getCpuUsage() {
    const startUsage = process.cpuUsage();
    // Small delay to measure CPU usage
    const now = Date.now();
    while (Date.now() - now < 100);
    const endUsage = process.cpuUsage(startUsage);
    
    // Convert to percentage based on elapsed time
    const elapsed = 100; // approx 100ms
    const cpuPercent = ((endUsage.user + endUsage.system) / (elapsed * 1000 * 1000)) * 100;
    
    return {
      percent: cpuPercent,
      user: endUsage.user,
      system: endUsage.system
    };
  }

  /**
   * Record a request metric
   */
  recordRequest(req, res, startTime) {
    if (!this.config.collectMetrics) return;

    const duration = Date.now() - startTime;
    const metric = {
      timestamp: Date.now(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    this.metrics.requests.push(metric);
    this.requestCount++;

    // Log performance if threshold exceeded
    if (this.config.logPerformance && duration > 5000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
    }

    this.enforceRetentionPolicy('requests');
  }

  /**
   * Record a performance metric
   */
  recordPerformance(operation, duration, details = {}) {
    if (!this.config.collectMetrics) return;

    const metric = {
      timestamp: Date.now(),
      operation: operation,
      duration: duration,
      details: details
    };

    this.metrics.performance.push(metric);
    this.enforceRetentionPolicy('performance');
  }

  /**
   * Record an error
   */
  recordError(error, context = {}) {
    if (!this.config.collectMetrics) return;

    const metric = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context: context,
      type: error.constructor.name
    };

    this.metrics.errors.push(metric);
    this.errorCount++;
    this.enforceRetentionPolicy('errors');
  }

  /**
   * Enforce retention policy for metrics
   */
  enforceRetentionPolicy(type) {
    const now = Date.now();
    const cutoff = now - this.config.metricsRetention;

    if (Array.isArray(this.metrics[type])) {
      this.metrics[type] = this.metrics[type].filter(
        metric => metric.timestamp > cutoff
      );
    }
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Calculate error rate
    const recentErrors = this.metrics.errors.filter(
      error => error.timestamp > (now - 300000) // Last 5 minutes
    ).length;

    const errorRate = this.requestCount > 0 
      ? (recentErrors / this.requestCount) * 100 
      : 0;

    // Calculate average response time for recent requests
    const recentRequests = this.metrics.requests.filter(
      req => req.timestamp > (now - 300000) // Last 5 minutes
    );

    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length
      : 0;

    // System health indicators
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      status: errorRate < 10 && heapUsedPercent < 90 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      statistics: {
        totalRequests: this.requestCount,
        totalErrors: this.errorCount,
        errorRate: errorRate,
        avgResponseTime: avgResponseTime,
        recentRequests: recentRequests.length
      },
      system: {
        heapUsedPercent: heapUsedPercent,
        memoryUsage: memoryUsage,
        cpuUsage: this.getCpuUsage()
      }
    };
  }

  /**
   * Get detailed metrics
   */
  getDetailedMetrics() {
    const now = Date.now();
    const fiveMinAgo = now - 300000; // 5 minutes ago

    // Calculate metrics for the last 5 minutes
    const recentRequests = this.metrics.requests.filter(r => r.timestamp > fiveMinAgo);
    const recentErrors = this.metrics.errors.filter(e => e.timestamp > fiveMinAgo);
    const recentPerformance = this.metrics.performance.filter(p => p.timestamp > fiveMinAgo);

    return {
      summary: {
        uptime: Date.now() - this.startTime,
        totalRequests: this.requestCount,
        totalErrors: this.errorCount,
        activeUsers: this.getActiveUsers()
      },
      recent: {
        requests: {
          count: recentRequests.length,
          avgDuration: recentRequests.length > 0 
            ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length 
            : 0,
          statusCodes: this.getStatusCodes(recentRequests)
        },
        errors: {
          count: recentErrors.length,
          types: this.getErrorTypes(recentErrors)
        },
        performance: {
          count: recentPerformance.length,
          avgDuration: recentPerformance.length > 0 
            ? recentPerformance.reduce((sum, p) => sum + p.duration, 0) / recentPerformance.length 
            : 0
        }
      },
      system: {
        memory: process.memoryUsage(),
        cpu: this.getCpuUsage(),
        os: {
          platform: os.platform(),
          arch: os.arch(),
          loadAverage: os.loadavg()
        }
      }
    };
  }

  /**
   * Get active users (approximation based on recent requests)
   */
  getActiveUsers() {
    const now = Date.now();
    const fiveMinAgo = now - 300000; // 5 minutes ago

    const recentRequests = this.metrics.requests.filter(
      req => req.timestamp > fiveMinAgo
    );

    // Count unique IPs in recent requests
    const uniqueIPs = new Set(recentRequests.map(req => req.ip));
    return uniqueIPs.size;
  }

  /**
   * Get status code distribution
   */
  getStatusCodes(requests) {
    const codes = {};
    requests.forEach(req => {
      codes[req.statusCode] = (codes[req.statusCode] || 0) + 1;
    });
    return codes;
  }

  /**
   * Get error type distribution
   */
  getErrorTypes(errors) {
    const types = {};
    errors.forEach(err => {
      types[err.type] = (types[err.type] || 0) + 1;
    });
    return types;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: [],
      performance: [],
      errors: [],
      system: []
    };
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Export metrics in standard format (Prometheus-style)
   */
  exportPrometheusMetrics() {
    const metrics = this.getDetailedMetrics();
    
    let prometheusOutput = '# HELP melius_operarius_requests_total Total number of requests\n';
    prometheusOutput += `# TYPE melius_operarius_requests_total counter\n`;
    prometheusOutput += `melius_operarius_requests_total ${metrics.summary.totalRequests}\n`;
    
    prometheusOutput += '\n# HELP melius_operarius_errors_total Total number of errors\n';
    prometheusOutput += `# TYPE melius_operarius_errors_total counter\n`;
    prometheusOutput += `melius_operarius_errors_total ${metrics.summary.totalErrors}\n`;
    
    prometheusOutput += '\n# HELP melius_operarius_uptime_seconds Uptime in seconds\n';
    prometheusOutput += `# TYPE melius_operarius_uptime_seconds gauge\n`;
    prometheusOutput += `melius_operarius_uptime_seconds ${Math.floor(metrics.summary.uptime / 1000)}\n`;
    
    prometheusOutput += '\n# HELP melius_operarius_active_users Number of active users\n';
    prometheusOutput += `# TYPE melius_operarius_active_users gauge\n`;
    prometheusOutput += `melius_operarius_active_users ${metrics.summary.activeUsers}\n`;
    
    prometheusOutput += '\n# HELP melius_operarius_memory_usage_bytes Memory usage in bytes\n';
    prometheusOutput += `# TYPE melius_operarius_memory_usage_bytes gauge\n`;
    prometheusOutput += `melius_operarius_memory_usage_bytes{type="rss"} ${metrics.system.memory.rss}\n`;
    prometheusOutput += `melius_operarius_memory_usage_bytes{type="heap_total"} ${metrics.system.memory.heapTotal}\n`;
    prometheusOutput += `melius_operarius_memory_usage_bytes{type="heap_used"} ${metrics.system.memory.heapUsed}\n`;
    
    return prometheusOutput;
  }
}

module.exports = MonitoringService;