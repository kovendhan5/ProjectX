# Utility Scripts

Collection of helper scripts for development, diagnostics, and automation tasks.

## Available Scripts

### Development Scripts

#### `reset-dev.sh` / `reset-dev.bat`
Complete environment reset for development.

**What it does**:
- Stops all Docker containers
- Removes volumes
- Cleans all node_modules and build artifacts
- Reinstalls dependencies
- Recreates database with migrations
- Runs seed data

**Usage**:
```bash
# Linux/Mac
./scripts/reset-dev.sh

# Windows
scripts\reset-dev.bat
```

**When to use**:
- After pulling major changes
- Database schema issues
- Dependency conflicts
- Clean slate needed

---

### Monitoring Scripts

#### `health-check.sh`
Checks health status of all services.

**Usage**:
```bash
./scripts/health-check.sh
```

**Environment Variables**:
```bash
API_URL=http://localhost:3001
BLOCKCHAIN_URL=http://localhost:3003
PHARMACY_URL=http://localhost:3002
REGULATOR_URL=http://localhost:3004
```

**Exit Codes**:
- `0`: All services healthy
- `1`: One or more services failed

**Use in CI/CD**:
```yaml
- name: Health Check
  run: ./scripts/health-check.sh
```

---

## Creating New Scripts

### Guidelines

1. **Naming**: Use kebab-case: `my-script.sh`
2. **Shebang**: Always include `#!/bin/bash` or `@echo off`
3. **Error Handling**: Use `set -e` for bash scripts
4. **Documentation**: Add clear comments
5. **Cross-platform**: Provide both `.sh` and `.bat` versions if needed

### Template (Bash)

```bash
#!/bin/bash
# Script description

set -e

echo "Starting..."

# Your code here

echo "✅ Done!"
```

### Template (Windows Batch)

```batch
@echo off
REM Script description

echo Starting...

REM Your code here

echo Done!
pause
```

---

## Future Scripts (TODO)

- [ ] `backup-db.sh` - Database backup script
- [ ] `restore-db.sh` - Database restore script
- [ ] `deploy.sh` - Automated deployment script
- [ ] `run-tests.sh` - Run all tests with coverage
- [ ] `generate-ssl.sh` - Generate self-signed SSL certificates
- [ ] `update-deps.sh` - Update all dependencies
- [ ] `check-ports.sh` - Check if required ports are available

---

## Troubleshooting

### Script Won't Execute (Linux/Mac)

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Permission Denied

Run with sudo (if needed):
```bash
sudo ./scripts/reset-dev.sh
```

### Docker Commands Fail

Ensure Docker is running:
```bash
docker ps
```

### Database Connection Issues

Check PostgreSQL is running:
```bash
docker-compose -f infrastructure/docker-compose.yml ps postgres
```
