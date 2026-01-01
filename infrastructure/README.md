# Infrastructure

Infrastructure configuration and deployment files for ProjectX.

## Contents

- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production-ready configuration
- `nginx.conf` - Nginx reverse proxy configuration
- `.env.production.example` - Production environment variables template

## Development Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Production Deployment

1. **Configure environment variables**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **With Nginx reverse proxy**:
   ```bash
   docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
   ```

## Services

### Development Ports
- **API**: 3001
- **Pharmacy Portal**: 3002
- **Blockchain**: 3003
- **Regulator Portal**: 3004
- **PostgreSQL**: 5432

### Production Configuration

All services include:
- Health checks
- Restart policies
- Resource limits (add in production)
- Proper networking

## Nginx Configuration

The `nginx.conf` file provides:
- Reverse proxy for all services
- SSL/TLS termination (configure SSL section)
- Load balancing ready
- WebSocket support

### SSL Setup

1. **Get certificates** (Let's Encrypt):
   ```bash
   certbot certonly --standalone -d api.yourdomain.com
   ```

2. **Update nginx.conf**:
   - Uncomment SSL server blocks
   - Update certificate paths
   - Configure your domain names

## Health Checks

All services expose health endpoints:
- API: `http://localhost:3001/health`
- Blockchain: `http://localhost:3003/health`

Use the health check script:
```bash
../scripts/health-check.sh
```

## Scaling

### Horizontal Scaling

Scale specific services:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### Vertical Scaling

Add resource limits in docker-compose.prod.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Container Stats
```bash
docker stats
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3001

# Stop container
docker-compose stop api
```

### Database Connection Failed
- Check PostgreSQL is running: `docker-compose ps postgres`
- Verify DATABASE_URL in .env
- Check network connectivity

### Service Won't Start
- Check logs: `docker-compose logs [service]`
- Verify environment variables
- Ensure dependencies are healthy

## Kubernetes (Future)

For Kubernetes deployment, see `k8s/` directory (to be created).

Recommended setup:
- Helm charts for services
- Horizontal Pod Autoscaler
- Ingress controller
- Persistent volumes for database
