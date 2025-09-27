#!/usr/bin/env node

// Script to test backend API endpoints
import axios from 'axios';

// Use the Render backend URL or localhost for local testing
const BASE_URL = process.env.BACKEND_URL || 'https://freshed-grocery-backend.onrender.com';

console.log('🧪 Testing Backend API Endpoints');
console.log('==============================\n');

console.log(`Base URL: ${BASE_URL}\n`);

// Test the root endpoint
async function testRootEndpoint() {
  try {
    console.log('Testing root endpoint (/)...');
    const response = await axios.get(BASE_URL);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    if (error.response) {
      console.log(`ℹ️  Status: ${error.response.status}`);
      console.log(`ℹ️  Response: ${JSON.stringify(error.response.data)}\n`);
    } else {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

// Test the API status endpoint (if it exists)
async function testStatusEndpoint() {
  try {
    console.log('Testing status endpoint (/api/status)...');
    const response = await axios.get(`${BASE_URL}/api/status`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    if (error.response) {
      console.log(`ℹ️  Status: ${error.response.status}`);
      console.log(`ℹ️  Response: ${JSON.stringify(error.response.data)}\n`);
    } else {
      console.log(`ℹ️  Status endpoint not found or not implemented\n`);
    }
  }
}

// Test the products endpoint (if it exists)
async function testProductsEndpoint() {
  try {
    console.log('Testing products endpoint (/api/products)...');
    const response = await axios.get(`${BASE_URL}/api/products`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Found ${response.data?.length || 0} products\n`);
  } catch (error) {
    if (error.response) {
      console.log(`ℹ️  Status: ${error.response.status}`);
      console.log(`ℹ️  Response: ${JSON.stringify(error.response.data)}\n`);
    } else {
      console.log(`ℹ️  Products endpoint not found or not implemented\n`);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testRootEndpoint();
  await testStatusEndpoint();
  await testProductsEndpoint();
  
  console.log('🏁 API Testing Complete');
}

// Run the tests
runAllTests();