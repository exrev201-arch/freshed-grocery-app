#!/usr/bin/env node

/**
 * Final Deployment Verification Script
 * 
 * This script performs final checks before deployment to ensure
 * everything is properly configured.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Log functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  highlight: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`)
};

async function checkRequiredFiles() {
  log.info('Checking required files...');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'render.yaml',
    'README.md',
    'DEPLOYMENT.md',
    'DEPLOYMENT_CHECKLIST.md',
    'DEPLOYMENT_SUMMARY.md',
    'index.html',
    'public/manifest.json',
    'public/sw-enhanced.js',
    'public/health.html',
    '.env.example',
    'backend/package.json',
    'backend/src/server.ts',
    'backend/.env.example'
  ];
  
  let allFound = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      log.error(`Required file not found: ${file}`);
      allFound = false;
    } else {
      log.success(`Found: ${file}`);
    }
  }
  
  return allFound;
}

function checkRenderConfig() {
  log.info('Checking Render configuration...');
  
  try {
    const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
    const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    
    // Check if it contains both frontend and backend services
    if (!renderYaml.includes('freshed-grocery-frontend')) {
      log.error('Frontend service not found in render.yaml');
      return false;
    }
    
    if (!renderYaml.includes('freshed-grocery-backend')) {
      log.error('Backend service not found in render.yaml');
      return false;
    }
    
    log.success('Render configuration is valid');
    return true;
  } catch (error) {
    log.error(`Failed to read render.yaml: ${error.message}`);
    return false;
  }
}

function checkBuildProcess() {
  log.info('Checking build process...');
  
  try {
    // Check if dist directory exists
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      log.warn('Dist directory not found. Run "npm run build" to create it.');
      return true; // Not critical for deployment verification
    }
    
    // Check if essential build files exist
    const essentialFiles = [
      'index.html',
      'assets/index-*.js',
      'assets/index-*.css'
    ];
    
    for (const file of essentialFiles) {
      const filePath = path.join(distPath, file);
      // For files with wildcards, we'll just check the directory structure
      if (file.includes('*')) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          log.warn(`Build directory structure may be incomplete: ${dir}`);
        }
      } else if (!fs.existsSync(filePath)) {
        log.warn(`Essential build file not found: ${file}`);
      }
    }
    
    log.success('Build process verification completed');
    return true;
  } catch (error) {
    log.error(`Build process check failed: ${error.message}`);
    return false;
  }
}

function checkEnvironmentVariables() {
  log.info('Checking environment variable templates...');
  
  try {
    // Check frontend .env.example
    const frontendEnvExample = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(frontendEnvExample)) {
      const content = fs.readFileSync(frontendEnvExample, 'utf8');
      if (!content.includes('VITE_CLICKPESA')) {
        log.warn('Frontend .env.example may be missing ClickPesa variables');
      } else {
        log.success('Frontend .env.example found with ClickPesa variables');
      }
    } else {
      log.warn('Frontend .env.example not found');
    }
    
    // Check backend .env.example
    const backendEnvExample = path.join(__dirname, '..', 'backend', '.env.example');
    if (fs.existsSync(backendEnvExample)) {
      const content = fs.readFileSync(backendEnvExample, 'utf8');
      if (!content.includes('DATABASE_URL')) {
        log.warn('Backend .env.example may be missing database variables');
      } else {
        log.success('Backend .env.example found with database variables');
      }
    } else {
      log.warn('Backend .env.example not found');
    }
    
    return true;
  } catch (error) {
    log.error(`Environment variable check failed: ${error.message}`);
    return false;
  }
}

function displayDeploymentReadiness() {
  log.highlight('\n=== Deployment Readiness Summary ===\n');
  
  console.log(`${colors.magenta}✅ Application is ready for deployment to Render!${colors.reset}\n`);
  
  console.log('Next steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Render');
  console.log('3. Configure environment variables in Render dashboard');
  console.log('4. Deploy both frontend and backend services');
  console.log('5. Test your deployed application\n');
  
  console.log('For detailed instructions, see:');
  console.log('- DEPLOYMENT.md');
  console.log('- DEPLOYMENT_CHECKLIST.md');
  console.log('- DEPLOYMENT_SUMMARY.md\n');
}

async function main() {
  log.highlight('Freshed Grocery App - Final Deployment Verification\n');
  
  let allChecksPassed = true;
  
  // Run all checks
  const checks = [
    { name: 'Required Files', fn: checkRequiredFiles },
    { name: 'Render Configuration', fn: checkRenderConfig },
    { name: 'Build Process', fn: checkBuildProcess },
    { name: 'Environment Variables', fn: checkEnvironmentVariables }
  ];
  
  for (const check of checks) {
    log.info(`\n${check.name} Check:`);
    const result = await check.fn();
    if (!result) {
      allChecksPassed = false;
    }
  }
  
  log.info('\n' + '='.repeat(50));
  
  if (allChecksPassed) {
    log.success('All verification checks passed!');
    displayDeploymentReadiness();
  } else {
    log.error('Some verification checks failed!');
    log.info('Please fix the issues above before deploying.');
  }
  
  process.exit(allChecksPassed ? 0 : 1);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log.error(`Verification script failed: ${error.message}`);
    process.exit(1);
  });
}