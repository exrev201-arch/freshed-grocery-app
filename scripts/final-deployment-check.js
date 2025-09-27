#!/usr/bin/env node

// Final deployment verification script
import { existsSync } from 'fs';
import { join } from 'path';

console.log('✅ Final Deployment Verification');
console.log('==========================\n');

// List of required files for deployment
const requiredFiles = [
  'render.yaml',
  'package.json',
  'backend/package.json',
  'backend/start.js',
  'scripts/generate-jwt-secrets.js',
  'scripts/verify-deployment.cjs',
  'scripts/test-backend-api.js',
  'scripts/test-frontend-build.js',
  'scripts/prepare-frontend-deploy.js',
  '.env.render',
  'DEPLOYMENT_GUIDE.md',
  'DEPLOYMENT_CHECKLIST.md',
  'DEPLOYMENT_SUMMARY.md',
  'DEPLOYMENT_COMPLETE.md',
  'FINAL_DEPLOYMENT_READY.md',
  'README.md'
];

// Check if all required files exist
let allFilesExist = true;
console.log('Checking required deployment files...\n');

requiredFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 ALL DEPLOYMENT FILES ARE PRESENT!');
  console.log('🚀 Your application is ready for deployment to Render.');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy frontend service using instructions in FINAL_DEPLOYMENT_READY.md');
  console.log('2. Update backend CORS after frontend deployment');
  console.log('3. Change default admin password after first login');
  console.log('4. Generate new JWT secrets for production use');
} else {
  console.log('❌ SOME DEPLOYMENT FILES ARE MISSING');
  console.log('Please check the missing files and ensure they are created.');
}

console.log('\n' + '='.repeat(50));
console.log('For detailed deployment instructions, see FINAL_DEPLOYMENT_READY.md');