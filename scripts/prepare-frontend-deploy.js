#!/usr/bin/env node

// Script to prepare frontend for deployment
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

console.log('📋 Preparing Frontend for Deployment');
console.log('================================\n');

// Environment variables for Render deployment
const renderEnvVars = {
  VITE_APP_URL: 'https://freshed-grocery-frontend.onrender.com',
  VITE_APP_NAME: 'Freshed Grocery Tanzania',
  VITE_CLICKPESA_API_KEY: 'SKm0mTf8iI5eORrH8APgmPrXlCTlHJPlFbHsca6SyE',
  VITE_CLICKPESA_MERCHANT_ID: 'IDUSrll2waj3bgI0q9YczUIlxAsLSdTF',
  VITE_CLICKPESA_PAY_BILL_NUMBER: '1804',
  VITE_CLICKPESA_BASE_URL: 'https://api.clickpesa.com',
  VITE_CLICKPESA_WEBHOOK_SECRET: 'freshed_clickpesa_webhook_2024_secure',
  VITE_CLICKPESA_DEMO_MODE: 'false',
  VITE_ADMIN_EMAIL: 'admin@freshed.co.tz',
  VITE_ADMIN_PASSWORD: 'Swordfish_1234'
};

// Create or update .env file for Render deployment
async function createRenderEnvFile() {
  try {
    console.log('Creating/updating .env file for Render deployment...\n');
    
    let envContent = '';
    for (const [key, value] of Object.entries(renderEnvVars)) {
      envContent += `${key}=${value}\n`;
    }
    
    const envPath = join(process.cwd(), '.env.render');
    await writeFile(envPath, envContent);
    
    console.log('✅ Created .env.render file with Render environment variables');
    console.log('📋 Environment variables:');
    console.log(envContent);
    
  } catch (error) {
    console.log('❌ Error creating .env.render file:');
    console.log(error.message);
  }
}

// Display deployment instructions
function displayDeploymentInstructions() {
  console.log('🚀 Frontend Deployment Instructions');
  console.log('================================\n');
  
  console.log('1. Go to Render Dashboard:');
  console.log('   - Visit https://dashboard.render.com');
  console.log('   - Click "New" → "Web Service"\n');
  
  console.log('2. Connect Repository:');
  console.log('   - Connect your GitHub account');
  console.log('   - Select your freshed-grocery-app repository\n');
  
  console.log('3. Configure Service:');
  console.log('   - Name: freshed-grocery-frontend');
  console.log('   - Environment: Node');
  console.log('   - Build Command: npm install && npm run build');
  console.log('   - Start Command: npm run preview');
  console.log('   - Plan: Free\n');
  
  console.log('4. Add Environment Variables:');
  console.log('   - Copy the variables from .env.render file');
  console.log('   - Add them in the "Advanced" section\n');
  
  console.log('5. Deploy:');
  console.log('   - Click "Create Web Service"');
  console.log('   - Wait for deployment to complete\n');
  
  console.log('6. Update Backend CORS:');
  console.log('   - After frontend deployment, update backend CORS_ORIGIN');
  console.log('   - Set to: https://freshed-grocery-frontend.onrender.com');
  console.log('   - Redeploy backend service\n');
}

// Display security recommendations
function displaySecurityRecommendations() {
  console.log('🔒 Security Recommendations');
  console.log('========================\n');
  
  console.log('1. Change Default Admin Password:');
  console.log('   - Current password: Swordfish_1234');
  console.log('   - Change after first login\n');
  
  console.log('2. Generate New JWT Secrets:');
  console.log('   - Run: npm run generate:secrets');
  console.log('   - Update backend environment variables\n');
  
  console.log('3. Verify ClickPesa Credentials:');
  console.log('   - Confirm API key and merchant ID are correct');
  console.log('   - Test payment integration\n');
  
  console.log('4. Check SendGrid Configuration:');
  console.log('   - Verify API key is correct');
  console.log('   - Confirm sender authentication\n');
}

// Main function
async function main() {
  await createRenderEnvFile();
  displayDeploymentInstructions();
  displaySecurityRecommendations();
  
  console.log('✅ Frontend preparation complete!');
  console.log('📋 Next steps: Follow the deployment instructions above');
}

// Run the script
main();