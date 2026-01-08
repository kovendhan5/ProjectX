# 🚀 ProjectX Quick Reference Card

Essential commands and information for daily development.

---

## ⚡ Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd ProjectX
make setup              # First-time setup

# Start development
make dev                # Start all services

# Access services
# API:              http://localhost:3001
# Pharmacy Portal:  http://localhost:3002
# Blockchain:       http://localhost:4000
# Regulator Portal: http://localhost:3004
```

---

## 🔧 Common Commands

### Development
```bash
make dev                # Start all services
make dev-api            # Start API only
make dev-blockchain     # Start blockchain only
make stop               # Stop all services
make logs               # View logs
make clean              # Clean build artifacts
```

### Database
```bash
make migrate            # Run migrations
make migrate-reset      # Reset database
make seed               # Seed sample data
make db-backup          # Backup database
make db-restore         # Restore database
```

### Testing
```bash
make test               # Run all tests
make test-api           # Test API only
make test-coverage      # Run with coverage
npm run test:watch      # Watch mode
```

### Code Quality
```bash
make lint               # Lint all code
make format             # Format code (Prettier)
make typecheck          # TypeScript check
```

### Docker
```bash
make docker-build       # Build images
make docker-up          # Start containers
make docker-down        # Stop containers
make docker-logs        # View container logs
make docker-clean       # Remove volumes
```

---

## 📂 Project Structure

```
ProjectX/
├── services/           # Backend services
│   ├── api/           # Express.js API
│   └── blockchain/    # Mock blockchain
├── clients/           # Frontend applications
│   ├── pharmacy-portal/
│   └── regulator-portal/
├── infrastructure/    # Docker configs
├── scripts/          # Automation scripts
└── docs/             # Documentation
```

---

## 🌐 API Endpoints

### Products
```
POST   /api/products              Create product
GET    /api/products              List products
GET    /api/products/:sku         Get by SKU
PUT    /api/products/:sku         Update product
DELETE /api/products/:sku         Delete product
```

### Batches
```
POST   /api/products/:sku/batches Create batch
GET    /api/products/:sku/batches List batches
GET    /api/batches/:batchNumber  Get batch
```

### Invoices
```
POST   /api/invoices              Create invoice
GET    /api/invoices              List invoices
GET    /api/invoices/:id          Get invoice
```

### System
```
GET    /api/health                Health check
GET    /api/health/db             Database check
GET    /api/health/blockchain     Blockchain check
GET    /metrics                   Prometheus metrics
```

---

## 🔑 Environment Variables

### API Service (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/projectx

# Server
PORT=3001
NODE_ENV=development

# Blockchain
BLOCKCHAIN_URL=http://localhost:4000

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3002,http://localhost:3004
```

### Frontends (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🐛 Debugging

### Check Service Health
```bash
curl http://localhost:3001/api/health
curl http://localhost:4000/api/blockchain/verify
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f blockchain

# Last 100 lines
docker compose logs --tail=100 api
```

### Database Access
```bash
# Connect to database
docker exec -it projectx-db psql -U projectx -d projectx_db

# Common queries
SELECT * FROM products;
SELECT * FROM batches WHERE product_id = 1;
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;
```

### Container Shell Access
```bash
docker exec -it projectx-api sh
docker exec -it projectx-blockchain sh
```

---

## 🔒 Security Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] Strong passwords (16+ characters)
- [ ] CORS origins restricted
- [ ] Helmet.js enabled
- [ ] Input validation (Zod)
- [ ] No secrets in code

---

## 📊 Performance Targets

| Metric | Target | Command |
|--------|--------|---------|
| API Response (p95) | < 200ms | Check Grafana |
| Database Query | < 50ms | Check logs |
| Error Rate | < 0.1% | Check Prometheus |
| Uptime | 99.9% | Check monitoring |

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Remove old containers
docker compose down -v

# Rebuild
docker compose up --build
```

### Database Connection Failed
```bash
# Check database is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Restart database
docker compose restart db
```

### Tests Failing
```bash
# Install dependencies
npm install

# Clear cache
npm run test -- --clearCache

# Check test database
DATABASE_URL="postgresql://..." npm test
```

---

## 📚 Essential Documentation

| Document | Link |
|----------|------|
| Quick Start | [QUICKSTART.md](QUICKSTART.md) |
| API Reference | [docs/API.md](docs/API.md) |
| Deployment | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Testing | [docs/TESTING.md](docs/TESTING.md) |
| Monitoring | [docs/MONITORING.md](docs/MONITORING.md) |
| Runbook | [RUNBOOK.md](RUNBOOK.md) |
| Full Index | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

## 🆘 Getting Help

1. **Check documentation**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **Search issues**: GitHub Issues tab
3. **Review runbook**: [RUNBOOK.md](RUNBOOK.md)
4. **Ask team**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🎯 Daily Checklist

### Morning
- [ ] Pull latest changes: `git pull`
- [ ] Update dependencies: `npm install`
- [ ] Start services: `make dev`
- [ ] Run health check: `make health-check`

### Before Committing
- [ ] Run tests: `make test`
- [ ] Lint code: `make lint`
- [ ] Format code: `make format`
- [ ] Update CHANGELOG if needed

### Before Deploying
- [ ] Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- [ ] Run full test suite
- [ ] Backup database
- [ ] Tag release

---

## 🔗 Useful Links

- **GitHub**: https://github.com/your-org/projectx
- **CI/CD**: https://github.com/your-org/projectx/actions
- **Staging**: https://staging.projectx.example.com
- **Production**: https://projectx.example.com
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090

---

## 💡 Pro Tips

1. **Use Makefile**: All common tasks have make commands
2. **Check logs first**: 90% of issues visible in logs
3. **Read error messages**: Error responses are descriptive
4. **Use VS Code**: Workspace config includes debug configs
5. **Hot reload enabled**: Changes reflect immediately
6. **Database seeded**: Sample data available on setup

---

## 🎓 Learning Path

New to the project? Follow this order:

1. [README.md](README.md) - 10 min
2. [QUICKSTART.md](QUICKSTART.md) - 30 min  
3. [docs/API.md](docs/API.md) - 40 min
4. [docs/architecture/](docs/architecture/) - 30 min
5. Start coding! 🚀

---

**Version**: 1.0.1  
**Last Updated**: 2026-01-07  
**Print this for your desk!**
