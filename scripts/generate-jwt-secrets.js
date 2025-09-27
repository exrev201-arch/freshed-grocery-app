#!/usr/bin/env node

// Script to generate secure JWT secrets
import { randomBytes } from 'crypto';

function generateSecret(length = 64) {
  return randomBytes(length).toString('hex');
}

console.log('🔐 JWT Secret Generator');
console.log('=====================\n');

const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();

console.log('Add these to your Render backend environment variables:');
console.log('-----------------------------------------------------');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('-----------------------------------------------------\n');

console.log('✅ Secrets generated successfully!');
console.log('⚠️  IMPORTANT: Store these securely and never commit them to version control.');