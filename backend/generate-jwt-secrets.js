/**
 * JWT Secret Generator
 * 
 * This script generates secure JWT secrets for your application.
 * Run this script to generate secrets for JWT_SECRET and JWT_REFRESH_SECRET.
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 32) {
    return crypto.randomBytes(length).toString('base64');
}

console.log('🔐 Freshed Grocery App - JWT Secret Generator');
console.log('=============================================\n');

console.log('Generated Secrets:');
console.log('------------------');

const jwtSecret = generateSecret(32);
const jwtRefreshSecret = generateSecret(32);
const webhookSecret = generateSecret(32);

console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log(`CLICKPESA_WEBHOOK_SECRET=${webhookSecret}\n`);

console.log('📝 Instructions:');
console.log('1. Copy these values to your backend .env file');
console.log('2. Update your frontend .env file with the webhook secret');
console.log('3. Store these secrets securely');
console.log('4. Never commit them to version control\n');

console.log('⚠️  Security Notes:');
console.log('   - These secrets should be at least 32 characters long');
console.log('   - Keep them confidential and rotate periodically');
console.log('   - Use different secrets for different environments\n');

// Also generate a sample .env section
console.log('📋 Sample .env entries:');
console.log('----------------------');
console.log('# JWT Secrets');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('');
console.log('# ClickPesa Webhook Secret');
console.log(`CLICKPESA_WEBHOOK_SECRET=${webhookSecret}`);