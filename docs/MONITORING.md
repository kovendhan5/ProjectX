# 📊 Monitoring & Observability Guide

Production monitoring setup for ProjectX using Prometheus, Grafana, and logging tools.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prometheus Setup](#prometheus-setup)
3. [Grafana Dashboards](#grafana-dashboards)
4. [Application Metrics](#application-metrics)
5. [Alerting Rules](#alerting-rules)
6. [Log Aggregation](#log-aggregation)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Monitoring Stack

```
┌─────────────────────────────────────────────────────┐
│                   Grafana                           │
│            (Visualization Layer)                    │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Prometheus  │ │     Loki     │ │   AlertMgr   │
│  (Metrics)   │ │    (Logs)    │ │   (Alerts)   │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │
        ▼               ▼
┌─────────────────────────────────────────────────────┐
│         Application Services                        │
│  API | Blockchain | Database | Frontends           │
└─────────────────────────────────────────────────────┘
```

### Key Metrics

- **Uptime**: 99.9% target
- **API Response Time (p95)**: < 200ms
- **Error Rate**: < 0.1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%

---

## 🔧 Prometheus Setup

### 1. Install Prometheus

**Docker Compose** (recommended):

```yaml
# infrastructure/docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped

volumes:
  prometheus-data:
```

### 2. Configure Prometheus

Create `infrastructure/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'projectx-production'
    replica: '1'

# Alert manager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Load alerting rules
rule_files:
  - 'alerts/*.yml'

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # API Service
  - job_name: 'api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'

  # Blockchain Service
  - job_name: 'blockchain'
    static_configs:
      - targets: ['blockchain:4000']
    metrics_path: '/metrics'

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Docker containers
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
```

### 3. Add Metrics to API Service

Install `prom-client`:

```bash
cd services/api
npm install prom-client
```

Create `services/api/src/middleware/metrics.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 5]
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1]
});

export const blockchainOperations = new client.Counter({
  name: 'blockchain_operations_total',
  help: 'Total blockchain operations',
  labelNames: ['operation', 'status']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(databaseQueryDuration);
register.registerMetric(blockchainOperations);

// Middleware to track requests
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
};

// Metrics endpoint
export const metricsHandler = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
};

export default register;
```

Update `services/api/src/app.ts`:

```typescript
import { metricsMiddleware, metricsHandler } from './middleware/metrics';

// ... existing imports

app.use(metricsMiddleware);

// ... existing routes

// Metrics endpoint
app.get('/metrics', metricsHandler);
```

---

## 📊 Grafana Dashboards

### 1. Install Grafana

Add to `docker-compose.monitoring.yml`:

```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  grafana-data:
```

### 2. Configure Data Source

Create `infrastructure/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### 3. Import Dashboards

Create `infrastructure/grafana/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1

providers:
  - name: 'ProjectX Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

### 4. Sample Dashboard JSON

Create `infrastructure/grafana/provisioning/dashboards/api-dashboard.json`:

```json
{
  "dashboard": {
    "title": "ProjectX API Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 📈 Application Metrics

### API Metrics

```promql
# Request rate (per second)
rate(http_requests_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# p95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# Success rate
rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])
```

### Database Metrics

```promql
# Query duration p95
histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m]))

# Active connections
pg_stat_activity_count

# Slow queries (> 1s)
pg_stat_statements_mean_time_seconds > 1
```

### System Metrics

```promql
# CPU usage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100
```

---

## 🚨 Alerting Rules

Create `infrastructure/prometheus/alerts/api-alerts.yml`:

```yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% over the last 5 minutes"

      # Slow response time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response time"
          description: "P95 response time is {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up{job="api"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API service is down"
          description: "API service has been down for more than 2 minutes"

      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"
```

### Configure Alert Manager

Create `infrastructure/alertmanager/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'email'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-receiver:8080/alerts'

  - name: 'email'
    email_configs:
      - to: 'alerts@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@example.com'
        auth_password: 'password'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

---

## 📝 Log Aggregation

### Loki Setup

Add to `docker-compose.monitoring.yml`:

```yaml
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki/loki-config.yml:/etc/loki/config.yml
      - loki-data:/loki
    command: -config.file=/etc/loki/config.yml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - /var/log:/var/log
      - ./loki/promtail-config.yml:/etc/promtail/config.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
```

---

## 🚀 Quick Start

### 1. Start Monitoring Stack

```bash
# Start all monitoring services
docker compose -f infrastructure/docker-compose.monitoring.yml up -d

# Verify services
docker ps | grep -E "prometheus|grafana|loki"
```

### 2. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Alert Manager**: http://localhost:9093

### 3. Import Dashboards

1. Login to Grafana
2. Navigate to Dashboards → Import
3. Import ID: 1860 (Node Exporter Full)
4. Import ID: 893 (Docker metrics)
5. Create custom ProjectX dashboard

---

## 🔍 Troubleshooting

### Prometheus Not Scraping Targets

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check if metrics endpoint is accessible
curl http://localhost:3001/metrics
```

### High Memory Usage in Prometheus

```yaml
# Reduce retention in prometheus.yml
--storage.tsdb.retention.time=15d

# Increase memory limit in docker-compose
mem_limit: 2g
```

### Missing Metrics in Grafana

1. Check data source connection
2. Verify Prometheus is scraping targets
3. Check time range in dashboard
4. Verify metric names in queries

---

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Alert Manager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

---

**Last Updated**: 2025-01-07  
**Version**: 1.0.0
