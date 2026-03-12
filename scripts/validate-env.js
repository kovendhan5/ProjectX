#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating environment configuration...\n');

const requiredServices = [
  {
    name: 'API Service',
    path: 'services/api/.env.example',
    envPath: 'services/api/.env',
    vars: ['PORT', 'NODE_ENV', 'DATABASE_URL', 'BLOCKCHAIN_SERVICE_URL'],
  },
  {
    name: 'Blockchain Service',
    path: 'services/blockchain/.env.example',
    envPath: 'services/blockchain/.env',
    vars: ['PORT', 'NODE_ENV'],
  },
  {
    name: 'Pharmacy Portal',
    path: 'clients/pharmacy-portal/.env.example',
    envPath: 'clients/pharmacy-portal/.env.local',
    vars: ['NEXT_PUBLIC_API_URL'],
  },
  {
    name: 'Regulator Portal',
    path: 'clients/regulator-portal/.env.example',
    envPath: 'clients/regulator-portal/.env.local',
    vars: ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_BLOCKCHAIN_URL'],
  },
];

let hasErrors = false;

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';
console.log(`✓ Node.js version: ${nodeVersion}`);
if (nodeVersion < requiredVersion) {
  console.error(`✗ Node.js ${requiredVersion} or higher is required`);
  hasErrors = true;
}

// Check Docker
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✓ Docker is installed');
} catch (error) {
  console.error('✗ Docker is not installed or not in PATH');
  hasErrors = true;
}

// Check Docker daemon
try {
  execSync('docker info', { stdio: 'pipe' });
  console.log('✓ Docker daemon is running');
} catch (error) {
  console.error('✗ Docker daemon is not running. Start Docker Desktop');
  hasErrors = true;
}

// Check Docker Compose
try {
  execSync('docker-compose --version', { stdio: 'pipe' });
  console.log('✓ Docker Compose is installed');
} catch (error) {
  console.error('✗ Docker Compose is not installed or not in PATH');
  hasErrors = true;
}

console.log('\n📋 Checking environment files...\n');

// Check environment files
requiredServices.forEach((service) => {
  const examplePath = path.join(process.cwd(), service.path);
  const envPath = path.join(process.cwd(), service.envPath || service.path.replace('.example', ''));

  if (!fs.existsSync(examplePath)) {
    console.error(`✗ ${service.name}: .env.example not found at ${service.path}`);
    hasErrors = true;
    return;
  }

  console.log(`✓ ${service.name}: .env.example exists`);

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠ ${service.name}: environment file not found (${service.envPath || '.env'})`);
    console.log(`  Create it from: ${examplePath}`);
  } else {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const missingVars = service.vars.filter(
      (varName) => !envContent.includes(`${varName}=`)
    );

    if (missingVars.length > 0) {
      console.warn(`⚠ ${service.name}: Missing variables: ${missingVars.join(', ')}`);
    } else {
      console.log(`  ✓ All required variables present`);
    }
  }
});

console.log('\n📦 Checking dependencies...\n');

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.warn('⚠ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('✓ node_modules exists');
}

// Check workspace dependencies
const workspaces = [
  'services/api',
  'services/blockchain',
  'clients/pharmacy-portal',
  'clients/regulator-portal',
];

workspaces.forEach((workspace) => {
  const packageJsonPath = path.join(process.cwd(), workspace, 'package.json');
  const rootModulesPath = path.join(process.cwd(), 'node_modules');
  const modulesPath = path.join(process.cwd(), workspace, 'node_modules');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠ ${workspace}: package.json not found`);
    return;
  }

  if (!fs.existsSync(modulesPath) && !fs.existsSync(rootModulesPath)) {
    console.warn(`⚠ ${workspace}: dependencies not installed`);
  } else {
    console.log(`✓ ${workspace}: dependencies installed`);
  }
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ Validation failed. Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('\n✅ Environment validation successful!\n');
  console.log('Next steps:');
  console.log('  1. Start PostgreSQL: docker-compose -f infrastructure/docker-compose.yml up -d postgres');
  console.log('  2. Run migrations: npm run db:migrate');
  console.log('  3. Seed database: npm run db:seed');
  console.log('  4. Start services: make dev\n');
  process.exit(0);
}
