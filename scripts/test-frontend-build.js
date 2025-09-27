#!/usr/bin/env node

// Script to test frontend build
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

console.log('🏗️  Testing Frontend Build Process');
console.log('=============================\n');

async function testFrontendBuild() {
  try {
    console.log('Running frontend build command...');
    const { stdout, stderr } = await execPromise('npm run build', { cwd: process.cwd() });
    
    if (stdout) {
      console.log('✅ Build output:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.log('⚠️  Build warnings:');
      console.log(stderr);
    }
    
    console.log('✅ Frontend build completed successfully!\n');
    
    // Check if dist folder exists
    console.log('Checking if dist folder was created...');
    const { stdout: lsOutput } = await execPromise('ls -la dist', { cwd: process.cwd() });
    console.log('✅ Dist folder contents:');
    console.log(lsOutput);
    
  } catch (error) {
    console.log('❌ Build failed:');
    console.log(error.message);
    if (error.stdout) {
      console.log('Output:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error output:', error.stderr);
    }
  }
}

// Run the test
testFrontendBuild();