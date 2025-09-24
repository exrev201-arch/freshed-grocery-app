#!/usr/bin/env node

/**
 * Deployment Script for Fresh Grocery App
 * 
 * This script helps with the deployment process to Render.
 * It checks configuration and prepares the application for deployment.
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

async function checkConfiguration() {
  log.info('Checking deployment configuration...');
  
  // Check if render.yaml exists
  const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
  if (!fs.existsSync(renderYamlPath)) {
    log.error('render.yaml not found in project root');
    return false;
  }
  log.success('render.yaml found');
  
  // Check frontend .env
  const frontendEnvPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    log.warn('.env file not found in frontend root');
  } else {
    log.success('Frontend .env file found');
  }
  
  // Check backend .env
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    log.warn('backend/.env file not found');
  } else {
    log.success('Backend .env file found');
  }
  
  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'index.html',
    'public/manifest.json',
    'public/sw-enhanced.js',
    'backend/package.json',
    'backend/src/server.ts'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      log.error(`Required file not found: ${file}`);
      return false;
    }
  }
  
  log.success('All required files found');
  return true;
}

function displayDeploymentInstructions() {
  log.highlight('\n=== Deployment Instructions ===\n');
  
  console.log(`${colors.magenta}1. Push your code to GitHub${colors.reset}`);
  console.log('   git add .');
  console.log('   git commit -m "Prepare for deployment"');
  console.log('   git push origin main\n');
  
  console.log(`${colors.magenta}2. Connect to Render${colors.reset}`);
  console.log('   - Go to https://dashboard.render.com');
  console.log('   - Connect your GitHub repository');
  console.log('   - Render will automatically detect render.yaml\n');
  
  console.log(`${colors.magenta}3. Set Environment Variables${colors.reset}`);
  console.log('   Frontend Service:');
  console.log('   - VITE_APP_URL=https://your-app-name.onrender.com');
  console.log('   - VITE_CLICKPESA_API_KEY=your_actual_key');
  console.log('   - VITE_CLICKPESA_MERCHANT_ID=your_merchant_id');
  console.log('   - VITE_CLICKPESA_PAY_BILL_NUMBER=your_pay_bill_number');
  console.log('   - VITE_CLICKPESA_DEMO_MODE=false (for production)\n');
  
  console.log('   Backend Service:');
  console.log('   - DATABASE_URL=your_database_connection_string');
  console.log('   - JWT_SECRET=your_jwt_secret');
  console.log('   - JWT_REFRESH_SECRET=your_refresh_secret');
  console.log('   - SMTP_USER=your_smtp_user');
  console.log('   - SMTP_PASS=your_smtp_password\n');
  
  console.log(`${colors.magenta}4. Deploy${colors.reset}`);
  console.log('   - Render will automatically deploy both services');
  console.log('   - Monitor deployment logs in the Render dashboard\n');
  
  console.log(`${colors.magenta}5. Access Your Application${colors.reset}`);
  console.log('   - Frontend: https://your-frontend-service-name.onrender.com');
  console.log('   - Backend API: https://your-backend-service-name.onrender.com\n');
}

async function main() {
  log.highlight('Fresh Grocery App Deployment Script\n');
  
  const isConfigured = await checkConfiguration();
  
  if (!isConfigured) {
    log.error('Deployment configuration check failed');
    process.exit(1);
  }
  
  log.success('Deployment configuration check passed!\n');
  
  displayDeploymentInstructions();
  
  log.info('For detailed deployment instructions, see DEPLOYMENT.md');
  log.success('Deployment preparation completed successfully!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log.error(`Deployment script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { checkConfiguration, displayDeploymentInstructions };