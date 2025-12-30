# Deployment Guide

## Overview

This guide covers deploying ProjectX to production environments.

## Prerequisites

- Docker and Docker Compose
- PostgreSQL database (managed service recommended)
- Domain name with SSL certificate
- Node.js 18+ for building

## Environment Configuration

### 1. API Service

Create `.env` in `services/api/`:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db-host:5432/projectx
BLOCKCHAIN_SERVICE_URL=https://blockchain.yourdomain.com
LOG_LEVEL=info
```

### 2. Blockchain Service

Create `.env` in `services/blockchain/`:

```env
PORT=3003
NODE_ENV=production
LOG_LEVEL=info
```

### 3. Frontend Applications

Create `.env.production` in client directories:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BLOCKCHAIN_URL=https://blockchain.yourdomain.com
```

## Deployment Options

### Option 1: Docker Compose (Single Server)

**Best for**: Development, staging, small production deployments

1. **Build images**:
   ```bash
   docker-compose -f infrastructure/docker-compose.yml build
   ```

2. **Start services**:
   ```bash
   docker-compose -f infrastructure/docker-compose.yml up -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec api npx prisma migrate deploy
   ```

4. **Setup reverse proxy** (Nginx or Traefik) for SSL termination

### Option 2: Kubernetes

**Best for**: Large-scale production, high availability

See `infrastructure/k8s/` for Kubernetes manifests (create this directory with deployment configs).

### Option 3: Cloud Platform (AWS/Azure/GCP)

#### AWS Deployment

**Architecture**:
- ECS Fargate for services
- RDS PostgreSQL for database
- Application Load Balancer
- CloudFront for static assets
- Route 53 for DNS

**Steps**:

1. **Database**: Create RDS PostgreSQL instance
2. **ECR**: Push Docker images to AWS ECR
3. **ECS**: Create ECS cluster and services
4. **ALB**: Configure load balancer with SSL
5. **S3**: Deploy Next.js static exports

#### Azure Deployment

**Architecture**:
- Azure Container Instances or AKS
- Azure Database for PostgreSQL
- Azure Load Balancer
- Azure CDN
- Azure DNS

#### Google Cloud Deployment

**Architecture**:
- Cloud Run for services
- Cloud SQL for PostgreSQL
- Cloud Load Balancing
- Cloud CDN
- Cloud DNS

## Database Migration

### Production Migration Strategy

1. **Backup** existing database
2. **Test** migrations on staging
3. **Schedule** maintenance window
4. **Apply** migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. **Verify** schema and data integrity

## SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d api.yourdomain.com -d pharmacy.yourdomain.com
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring and Logging

### Application Monitoring

**Recommended Tools**:
- **Prometheus** + **Grafana** for metrics
- **Sentry** for error tracking
- **Datadog** or **New Relic** for APM

### Log Aggregation

**Options**:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs (AWS)
- Azure Monitor
- Google Cloud Logging

### Health Checks

All services expose health endpoints:
- API: `https://api.yourdomain.com/health`
- Blockchain: `https://blockchain.yourdomain.com/health`

## Security Checklist

- [ ] Enable HTTPS/TLS for all services
- [ ] Use strong database passwords
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up authentication/authorization
- [ ] Rotate secrets regularly
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Implement backup strategy
- [ ] Set up DDoS protection

## Backup Strategy

### Database Backups

**Automated daily backups**:
```bash
# Example cron job
0 2 * * * pg_dump -h localhost -U user projectx > /backups/projectx_$(date +\%Y\%m\%d).sql
```

**Retention policy**:
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

### Application Data

- Store backups in S3/Azure Blob/GCS
- Encrypt backups at rest
- Test restore procedures regularly

## Scaling Considerations

### Horizontal Scaling

- API service: Scale to multiple instances behind load balancer
- Frontend: Use CDN for static assets
- Database: Use read replicas for query load

### Vertical Scaling

- Increase CPU/memory for individual services
- Optimize database queries and indexes
- Use caching (Redis) for frequently accessed data

## CI/CD Pipeline

### GitHub Actions (Included)

The project includes `.github/workflows/ci.yml` for:
- Automated testing
- Docker image builds
- Deployment triggers

### Deployment Automation

Add deployment job to CI pipeline:

```yaml
deploy:
  needs: [lint-and-test, docker-build]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy to production
      run: |
        # SSH to server and pull latest images
        # Or deploy to Kubernetes
        # Or trigger cloud deployment
```

## Performance Optimization

### API Optimization

- Enable response compression
- Implement caching headers
- Use database connection pooling
- Add Redis for session/cache storage

### Frontend Optimization

- Enable Next.js production optimizations
- Use CDN for static assets
- Implement code splitting
- Optimize images (Next.js Image component)

## Disaster Recovery

### Recovery Time Objective (RTO)

Target: < 4 hours

### Recovery Point Objective (RPO)

Target: < 1 hour (maximum data loss)

### Recovery Procedure

1. Identify failure scope
2. Restore from latest backup
3. Verify data integrity
4. Update DNS if needed
5. Run smoke tests
6. Monitor closely

## Cost Optimization

### AWS Estimates (Monthly)

- **Small deployment**: $100-300
  - t3.medium instances
  - RDS db.t3.small
  - 50GB storage
  
- **Medium deployment**: $500-1000
  - t3.large instances
  - RDS db.m5.large
  - 200GB storage
  - CloudFront CDN

- **Large deployment**: $2000+
  - Multiple availability zones
  - Auto-scaling groups
  - RDS Multi-AZ
  - Premium support

## Support and Maintenance

### Regular Maintenance Tasks

- Weekly: Review logs and metrics
- Monthly: Security updates and patches
- Quarterly: Performance review and optimization
- Annually: Disaster recovery drill

### On-Call Procedures

1. Set up alerting (PagerDuty, OpsGenie)
2. Create runbooks for common issues
3. Establish escalation procedures
4. Document incident response process

## Rollback Strategy

### Quick Rollback

```bash
# Revert to previous Docker image
docker-compose pull
docker-compose up -d --no-deps [service-name]
```

### Database Rollback

- More complex, requires careful planning
- Always test migrations on staging first
- Keep migration rollback scripts ready

## Post-Deployment Checklist

- [ ] All services are healthy
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] Monitoring dashboards configured
- [ ] Alerts set up
- [ ] Backups running
- [ ] DNS propagated
- [ ] Load balancer configured
- [ ] Smoke tests passed
- [ ] Documentation updated

## Troubleshooting

### Common Issues

**Service won't start**:
- Check logs: `docker-compose logs [service]`
- Verify environment variables
- Check port availability

**Database connection failed**:
- Verify DATABASE_URL
- Check network connectivity
- Confirm credentials

**High latency**:
- Check database query performance
- Review application logs
- Monitor resource usage
- Consider scaling

## Contact

For deployment support: devops@projectx.example.com
