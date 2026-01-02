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

### Database Scripts

#### `backup-db.sh` / `backup-db.bat`
Creates timestamped database backup.

**Usage**:
```bash
# Linux/Mac
./scripts/backup-db.sh

# Windows
scripts\backup-db.bat
```

**Features**:
- Automatic compression (gzip/7zip)
- Timestamped filenames
- Automatic cleanup (keeps 7 days)
- Docker and local PostgreSQL support

**Backup Location**: `./backups/`

---

#### `restore-db.sh`
Restores database from backup file.

**Usage**:
```bash
./scripts/restore-db.sh backups/projectx_backup_20240101_120000.sql.gz
```

**⚠️ Warning**: This will overwrite the current database!

**Features**:
- Automatic decompression
- Safety confirmation prompt
- Runs migrations after restore

---

### Testing Scripts

#### `run-tests.sh` / `run-tests.bat`
Runs complete test suite with coverage.

**Usage**:
```bash
# Linux/Mac
./scripts/run-tests.sh

# Windows
scripts\run-tests.bat
```

**What it tests**:
- API Service (unit + integration)
- Blockchain Service
- Pharmacy Portal
- Regulator Portal

**Output**:
- Terminal test results
- Coverage reports in each service's `coverage/` directory
- HTML reports for detailed analysis

---

### Validation Scripts

#### `validate-env.sh` / `validate-env.bat`
Validates environment configuration.

**Usage**:
```bash
# Linux/Mac
./scripts/validate-env.sh

# Windows
scripts\validate-env.bat
```

**Checks**:
- Required environment variables
- Environment files exist
- Configuration completeness

**Use before**:
- Starting development
- Deployment
- CI/CD runs

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

- [ ] `generate-ssl.sh` - Generate self-signed SSL certificates
- [ ] `update-deps.sh` - Update all dependencies
- [ ] `check-ports.sh` - Check if required ports are available
- [ ] `load-test.sh` - Run performance/load tests
- [ ] `security-scan.sh` - Run security vulnerability scan

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
