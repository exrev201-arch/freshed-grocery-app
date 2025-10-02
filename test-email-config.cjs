/**
 * Email Configuration Test Script
 * Tests Gmail SMTP configuration for Freshed Grocery
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function testEmailConfig() {
  console.log('Testing Email Configuration...');
  console.log('============================');
  
  // Check if required environment variables are set
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing environment variables:', missingEnvVars);
    console.log('Please check your .env file');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('From Email:', process.env.FROM_EMAIL);
  console.log('');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Only for testing - remove in production
    }
  });
  
  // Verify connection configuration
  try {
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return;
  }
  
  // Send test email
  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Freshed Grocery OTP Test',
      text: 'This is a test email to verify your SMTP configuration for Freshed Grocery.',
      html: '<h1>Freshed Grocery OTP Test</h1><p>This is a test email to verify your SMTP configuration for Freshed Grocery.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    return;
  }
  
  console.log('');
  console.log('🎉 Email configuration test completed successfully!');
  console.log('You can now use Gmail for sending OTP codes in your application.');
}

// Run the test
testEmailConfig().catch(console.error);