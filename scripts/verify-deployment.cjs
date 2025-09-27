#!/usr/bin/env node

// Script to verify deployment configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Deployment Configuration Verification');
console.log('=====================================\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'render.yaml',
  'backend/start.js',
  'vite.config.ts'
];

let allFilesExist = true;
console.log('Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});
console.log();

// Check backend start script
console.log('Checking backend start script...');
const startScriptPath = path.join(__dirname, '..', 'backend', 'package.json');
if (fs.existsSync(startScriptPath)) {
  const backendPackage = JSON.parse(fs.readFileSync(startScriptPath, 'utf8'));
  if (backendPackage.scripts && backendPackage.scripts.start === 'node start.js') {
    console.log('✅ Backend start script is correctly configured');
  } else {
    console.log('❌ Backend start script is not configured correctly');
    console.log('   Expected: "start": "node start.js"');
  }
} else {
  console.log('❌ Backend package.json not found');
}
console.log();

// Check render.yaml configuration
console.log('Checking render.yaml configuration...');
const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
if (fs.existsSync(renderYamlPath)) {
  const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
  if (renderYaml.includes('freshed-grocery-frontend') && renderYaml.includes('freshed-grocery-backend')) {
    console.log('✅ render.yaml contains both frontend and backend services');
  } else {
    console.log('❌ render.yaml is missing service definitions');
  }
  
  if (renderYaml.includes('buildCommand: npm install && npm run build') && 
      renderYaml.includes('staticPublishPath: ./dist')) {
    console.log('✅ Frontend build configuration is correct');
  } else {
    console.log('❌ Frontend build configuration is incorrect');
  }
  
  if (renderYaml.includes('buildCommand: npm install && cd backend && npm install') && 
      renderYaml.includes('startCommand: cd backend && npm start')) {
    console.log('✅ Backend build/start configuration is correct');
  } else {
    console.log('❌ Backend build/start configuration is incorrect');
  }
} else {
  console.log('❌ render.yaml not found');
}
console.log();

// Summary
console.log('📋 Verification Summary');
console.log('====================');
if (allFilesExist) {
  console.log('✅ All required files are present');
} else {
  console.log('❌ Some required files are missing');
}

console.log('\n💡 Next Steps:');
console.log('1. Ensure all environment variables are set in Render dashboard');
console.log('2. Deploy both services to Render');
console.log('3. Test the application functionality');
console.log('4. Update CORS_ORIGIN with your actual frontend URL after deployment');
