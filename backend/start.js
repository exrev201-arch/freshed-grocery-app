#!/usr/bin/env node

// Simple wrapper to start the TypeScript server
const { spawn } = require('child_process');

// Check if tsx is available
const tsxCheck = spawn('npm', ['list', 'tsx'], { shell: true });

tsxCheck.on('close', (code) => {
  if (code === 0) {
    // tsx is available, use it to run the server
    console.log('Starting server with tsx...');
    const server = spawn('npx', ['tsx', 'src/server.ts'], { 
      stdio: 'inherit',
      shell: true
    });
    
    server.on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
  } else {
    // tsx is not available, try to install it first
    console.log('tsx not found, installing...');
    const install = spawn('npm', ['install', 'tsx'], { 
      stdio: 'inherit',
      shell: true
    });
    
    install.on('close', (installCode) => {
      if (installCode === 0) {
        console.log('tsx installed successfully, starting server...');
        const server = spawn('npx', ['tsx', 'src/server.ts'], { 
          stdio: 'inherit',
          shell: true
        });
        
        server.on('error', (error) => {
          console.error('Failed to start server:', error);
          process.exit(1);
        });
      } else {
        console.error('Failed to install tsx');
        process.exit(1);
      }
    });
  }
});