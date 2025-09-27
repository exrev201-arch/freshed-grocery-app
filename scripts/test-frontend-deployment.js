#!/usr/bin/env node

// Script to test frontend deployment configuration
import { spawn } from 'child_process';

console.log('🧪 Testing Frontend Deployment Configuration');
console.log('=====================================\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'vite.config.ts',
  'package.json',
  'render.yaml'
];

import { existsSync } from 'fs';
import { join } from 'path';

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Missing required files. Please check your project structure.');
  process.exit(1);
}

console.log('\n2. Checking package.json scripts...');
import { readFileSync } from 'fs';

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  if (scripts && scripts.preview) {
    console.log(`   ✅ Preview script: ${scripts.preview}`);
    if (scripts.preview.includes('--host')) {
      console.log('   ✅ Host binding detected in preview script');
    } else {
      console.log('   ⚠️  Consider adding --host flag to preview script');
    }
  } else {
    console.log('   ❌ Preview script not found');
  }
  
  if (scripts && scripts.build) {
    console.log(`   ✅ Build script: ${scripts.build}`);
  } else {
    console.log('   ❌ Build script not found');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

console.log('\n3. Checking Vite configuration...');
try {
  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('host: true')) {
    console.log('   ✅ Host binding configured in vite.config.ts');
  } else {
    console.log('   ⚠️  Consider adding host: true to server configuration');
  }
} catch (error) {
  console.log('   ❌ Error reading vite.config.ts:', error.message);
}

console.log('\n4. Checking Render configuration...');
try {
  const renderConfig = readFileSync('render.yaml', 'utf8');
  if (renderConfig.includes('startCommand: npm run preview')) {
    console.log('   ✅ Render start command configured correctly');
  } else {
    console.log('   ⚠️  Check render.yaml startCommand configuration');
  }
  
  if (renderConfig.includes('PORT')) {
    console.log('   ✅ PORT environment variable configured');
  } else {
    console.log('   ⚠️  Consider adding PORT environment variable to render.yaml');
  }
} catch (error) {
  console.log('   ❌ Error reading render.yaml:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Frontend deployment configuration check complete!');
console.log('\n📋 Next steps:');
console.log('1. Push all changes to your GitHub repository');
console.log('2. Redeploy your frontend service on Render');
console.log('3. Monitor the deployment logs for any errors');
console.log('4. Test your application at the Render URL');