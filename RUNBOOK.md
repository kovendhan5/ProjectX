# 🔧 Operations Runbook

Standard Operating Procedures (SOPs) for ProjectX maintenance and troubleshooting.

---

## 📖 Table of Contents

1. [Daily Operations](#daily-operations)
2. [Common Issues](#common-issues)
3. [Database Maintenance](#database-maintenance)
4. [Performance Tuning](#performance-tuning)
5. [Security Procedures](#security-procedures)
6. [Incident Response](#incident-response)

---

## 📅 Daily Operations

### Morning Health Check

**Frequency**: Every morning, 9:00 AM

```bash
# 1. Check service health
./scripts/health-check.sh

# 2. Review logs for errors (last 24 hours)
docker compose logs --tail=100 --since=24h | grep -i error

# 3. Check disk space
df -h

# 4. Check database size
psql -U projectx -d projectx_db -c "SELECT pg_size_pretty(pg_database_size('projectx_db'));"

# 5. Check container resource usage
docker stats --no-stream
```

**Expected Results**:
- All health checks return 200 OK
- No critical errors in logs
- Disk usage < 80%
- Database size growing steadily
- CPU < 60%, Memory < 70%

---

### Backup Verification

**Frequency**: Daily, 2:00 AM (automated)

```bash
# Verify latest backup exists
ls -lh backups/ | head -5

# Verify backup size (should be > 1MB)
du -h backups/projectx_*.sql | tail -1

# Test restore on staging (weekly)
./scripts/restore-db.sh backups/latest.sql --staging
```

---

### Log Rotation

**Frequency**: Weekly, Sunday 3:00 AM

```bash
# Archive old logs
tar -czf logs/archive/logs_$(date +%Y%m%d).tar.gz logs/*.log

# Clear logs older than 30 days
find logs/ -name "*.log" -mtime +30 -delete

# Restart services to release file handles
docker compose restart
```

---

## 🚨 Common Issues

### Issue 1: API Service Not Responding

**Symptoms**:
- Health check returns 503 or timeout
- Users report "Cannot connect to server"

**Diagnosis**:
```bash
# Check if container is running
docker ps | grep api

# Check container logs
docker compose logs api --tail=50

# Check process inside container
docker compose exec api ps aux
```

**Resolution**:
```bash
# Restart API service
docker compose restart api

# If that doesn't work, rebuild
docker compose up -d --build api

# Check database connection
docker compose exec api npm run migrate:status
```

**Escalation**: If issue persists > 5 minutes, page on-call engineer.

---

### Issue 2: Database Connection Pool Exhausted

**Symptoms**:
- Logs show "Too many clients already"
- API requests timing out
- Increasing response times

**Diagnosis**:
```bash
# Check active connections
psql -U projectx -d projectx_db -c "SELECT count(*) FROM pg_stat_activity;"

# List long-running queries
psql -U projectx -d projectx_db -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"
```

**Resolution**:
```bash
# Kill long-running queries
psql -U projectx -d projectx_db -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE now() - query_start > interval '5 minutes';"

# Increase max connections (in postgresql.conf)
# max_connections = 200

# Restart database
docker compose restart db
```

---

### Issue 3: Blockchain Service Sync Issues

**Symptoms**:
- Hash mismatches
- Transactions not recorded
- Verification failures

**Diagnosis**:
```bash
# Check blockchain service logs
docker compose logs blockchain --tail=100

# Verify last block
curl http://localhost:4000/api/blockchain/verify
```

**Resolution**:
```bash
# Restart blockchain service
docker compose restart blockchain

# If corrupted, reinitialize (LAST RESORT)
docker compose exec blockchain rm -rf /data/blockchain.json
docker compose restart blockchain

# Re-sync from database
curl -X POST http://localhost:4000/api/blockchain/resync
```

---

### Issue 4: High Memory Usage

**Symptoms**:
- Container OOM killed
- Slow response times
- Swap usage increasing

**Diagnosis**:
```bash
# Check container memory
docker stats --no-stream

# Check Node.js heap
docker compose exec api node -e "console.log(process.memoryUsage())"
```

**Resolution**:
```bash
# Increase container memory limit (docker-compose.yml)
mem_limit: 1024m

# Restart with new limits
docker compose up -d

# Enable Node.js garbage collection logs
NODE_OPTIONS="--max-old-space-size=512 --gc-interval=100"
```

---

### Issue 5: Frontend Build Failures

**Symptoms**:
- Next.js build errors
- Blank pages in production
- JavaScript errors in console

**Diagnosis**:
```bash
# Check build logs
docker compose logs pharmacy-portal --tail=100

# Try local build
cd clients/pharmacy-portal
npm run build
```

**Resolution**:
```bash
# Clear Next.js cache
rm -rf clients/pharmacy-portal/.next

# Rebuild image
docker compose build pharmacy-portal

# Restart service
docker compose up -d pharmacy-portal
```

---

## 🗄️ Database Maintenance

### Weekly Maintenance Tasks

**Frequency**: Every Sunday, 2:00 AM

```bash
# 1. Analyze tables for query optimization
psql -U projectx -d projectx_db -c "ANALYZE;"

# 2. Vacuum to reclaim space
psql -U projectx -d projectx_db -c "VACUUM VERBOSE;"

# 3. Reindex if needed
psql -U projectx -d projectx_db -c "REINDEX DATABASE projectx_db;"

# 4. Check for bloated tables
psql -U projectx -d projectx_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

---

### Performance Monitoring Queries

```sql
-- Slow queries (> 1 second)
SELECT 
  query, 
  calls, 
  total_time, 
  mean_time, 
  max_time 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY total_time DESC 
LIMIT 20;

-- Table sizes
SELECT 
  tablename, 
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Index usage
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan, 
  idx_tup_read, 
  idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND schemaname NOT IN ('pg_catalog', 'information_schema');
```

---

### Data Archival

**Frequency**: Quarterly

Archive data older than 1 year to reduce database size:

```sql
-- Create archive table
CREATE TABLE invoices_archive AS 
SELECT * FROM invoices WHERE created_at < NOW() - INTERVAL '1 year';

-- Verify data
SELECT COUNT(*) FROM invoices_archive;

-- Delete from main table
DELETE FROM invoices WHERE created_at < NOW() - INTERVAL '1 year';

-- Vacuum to reclaim space
VACUUM FULL invoices;
```

---

## ⚡ Performance Tuning

### API Performance Optimization

**Target Metrics**:
- p50: < 100ms
- p95: < 200ms
- p99: < 500ms

**Tuning Steps**:

1. **Enable Query Caching** (Redis)
```typescript
// Add Redis caching layer
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache product lookups
const cachedProduct = await redis.get(`product:${sku}`);
if (cachedProduct) return JSON.parse(cachedProduct);
```

2. **Database Connection Pooling**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_size = 20
  connection_limit = 100
}
```

3. **Add Database Indexes**
```sql
-- Index frequently queried fields
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_batch_product_id ON batches(product_id);
CREATE INDEX idx_invoice_customer_email ON invoices(customer_email);
CREATE INDEX idx_invoice_created_at ON invoices(created_at DESC);
```

4. **Enable Compression**
```typescript
// services/api/src/app.ts
import compression from 'compression';
app.use(compression());
```

---

### Frontend Performance

1. **Enable Next.js Image Optimization**
```jsx
import Image from 'next/image';
<Image src="/logo.png" width={200} height={50} alt="Logo" />
```

2. **Add Static Asset Caching**
```nginx
# nginx.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

3. **Enable CDN**
- Configure CloudFlare or AWS CloudFront
- Set cache TTL: 1 hour for API, 1 day for static assets

---

## 🔒 Security Procedures

### Monthly Security Audit

**Frequency**: First Monday of each month

```bash
# 1. Check for dependency vulnerabilities
npm audit --production

# 2. Update dependencies (patch versions only)
npm update

# 3. Check Docker image vulnerabilities
docker scan projectx-api:latest

# 4. Review access logs for suspicious activity
grep -E "401|403|404" logs/nginx.log | tail -100

# 5. Rotate secrets
# - Database passwords
# - API keys
# - JWT secrets
```

---

### SSL Certificate Renewal

**Frequency**: Every 80 days (Let's Encrypt)

```bash
# Auto-renewal (via certbot)
certbot renew --nginx

# Manual renewal
certbot certonly --nginx -d projectx.example.com

# Restart nginx
docker compose restart nginx
```

---

### User Audit

**Frequency**: Quarterly

```sql
-- List all admin users
SELECT id, email, role, created_at, last_login 
FROM users 
WHERE role = 'admin';

-- List inactive users (no login in 90 days)
SELECT id, email, last_login 
FROM users 
WHERE last_login < NOW() - INTERVAL '90 days';

-- Revoke access for terminated employees
UPDATE users SET is_active = false WHERE email IN ('user@example.com');
```

---

## 🚨 Incident Response

### Severity Levels

| Severity | Description | Response Time | Escalation |
|----------|-------------|---------------|------------|
| P0 | Complete outage | Immediate | Page on-call + CTO |
| P1 | Partial outage, major feature down | 15 minutes | Page on-call |
| P2 | Performance degradation | 1 hour | Email team |
| P3 | Minor bug, no user impact | 24 hours | Create ticket |

---

### P0 Incident Response

**Complete System Outage**

1. **Immediate Actions** (0-5 minutes)
```bash
# Declare incident
echo "P0 INCIDENT: $(date)" >> incidents.log

# Check service status
./scripts/health-check.sh

# Check infrastructure
docker ps -a
df -h
free -h
```

2. **Communication** (5-10 minutes)
- Post in #incidents Slack channel
- Update status page: "We're investigating an issue"
- Page on-call engineer

3. **Investigation** (10-30 minutes)
- Review logs: `docker compose logs --tail=500`
- Check metrics dashboard
- Identify root cause

4. **Resolution** (30-60 minutes)
- Apply fix
- Test thoroughly
- Monitor for 15 minutes

5. **Post-Incident** (within 24 hours)
- Write incident report
- Root cause analysis
- Prevention plan
- Team retrospective

---

### Rollback Procedure

If deployment causes issues:

```bash
# 1. Stop current deployment
docker compose down

# 2. Restore database backup
./scripts/restore-db.sh backups/pre-deployment.sql

# 3. Checkout previous version
git checkout <previous-stable-tag>

# 4. Rebuild and restart
docker compose build
docker compose up -d

# 5. Verify health
./scripts/health-check.sh

# 6. Notify stakeholders
echo "Rollback completed at $(date)" | mail -s "Rollback Notification" team@example.com
```

---

## 📊 Metrics & Alerts

### Key Performance Indicators (KPIs)

Monitor these metrics:

- **Uptime**: 99.9% (monthly)
- **API Response Time (p95)**: < 200ms
- **Error Rate**: < 0.1%
- **Database Query Time (p95)**: < 50ms
- **Disk Usage**: < 80%

---

### Alert Thresholds

Configure alerts for:

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time | > 300ms | > 1000ms |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 80% | > 90% |
| Database Connections | > 80 | > 150 |

---

## 📞 Emergency Contacts

**On-Call Engineer**: 
- Name: [On-Call Rotation]
- Phone: [XXX-XXX-XXXX]
- Email: oncall@example.com

**DevOps Lead**: 
- Name: [Name]
- Phone: [XXX-XXX-XXXX]
- Email: devops@example.com

**CTO**: 
- Name: [Name]
- Phone: [XXX-XXX-XXXX]
- Email: cto@example.com

**Service Providers**:
- Hosting: support@hosting.com | +1-XXX-XXX-XXXX
- Domain: support@domain.com | +1-XXX-XXX-XXXX

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-01-05 | Initial runbook creation | DevOps Team |

---

**Version**: 1.0.0  
**Last Reviewed**: 2025-01-05  
**Next Review**: 2025-04-05
