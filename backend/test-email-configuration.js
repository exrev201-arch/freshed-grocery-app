/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration using the environment variables.
 * Run this script to verify your email settings before deploying to Render.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Get email configuration from environment variables
const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS
    }
};

const fromEmail = process.env.FROM_EMAIL || 'Freshed Grocery <noreply@freshed.co.tz>';
const testRecipient = process.env.TEST_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || 'admin@freshed.co.tz';

console.log('📧 Testing Email Configuration...');
console.log('==================================\n');

// Hide sensitive information in logs
const safeConfig = {
    ...emailConfig,
    auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass ? '****' : 'NOT SET'
    }
};

console.log('🔧 Email Configuration:');
console.log(`   Host: ${emailConfig.host}`);
console.log(`   Port: ${emailConfig.port}`);
console.log(`   Secure: ${emailConfig.secure}`);
console.log(`   User: ${safeConfig.auth.user}`);
console.log(`   Pass: ${safeConfig.auth.pass}`);
console.log(`   From: ${fromEmail}`);
console.log(`   Test Recipient: ${testRecipient}\n`);

// Check for missing configuration
const missingConfig = [];
if (!process.env.SMTP_USER) missingConfig.push('SMTP_USER');
if (!process.env.SMTP_PASS) missingConfig.push('SMTP_PASS');

if (missingConfig.length > 0) {
    console.error('❌ Missing required email configuration:');
    missingConfig.forEach(config => {
        console.error(`   - ${config}`);
    });
    console.error('\nPlease set these values in your .env file');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

async function testEmail() {
    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP server connection verified successfully!\n');
        
        // Send test email
        console.log('📤 Sending test email...');
        const info = await transporter.sendMail({
            from: fromEmail,
            to: testRecipient,
            subject: 'Freshed Grocery - Email Configuration Test',
            text: `Hello! This is a test email from your Freshed Grocery application.

If you received this email, your email configuration is working correctly!

Best regards,
Freshed Grocery Team`,
            html: `
                <h2>Freshed Grocery - Email Configuration Test</h2>
                <p>Hello!</p>
                <p>This is a test email from your <strong>Freshed Grocery</strong> application.</p>
                <p style="color: green; font-weight: bold;">✅ If you received this email, your email configuration is working correctly!</p>
                <br>
                <p>Best regards,<br>
                <strong>Freshed Grocery Team</strong></p>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Recipient: ${testRecipient}`);
        console.log('\n🎉 Email configuration is ready for production!\n');
        
    } catch (error) {
        console.error('❌ Email configuration test failed:');
        console.error(`   Message: ${error.message}`);
        
        if (error.code) {
            console.error(`   Code: ${error.code}`);
        }
        
        // Common error solutions
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Check that your SMTP credentials are correct');
        console.log('   2. If using SendGrid, ensure you have a valid API key');
        console.log('   3. Verify that your email provider allows SMTP access');
        console.log('   4. Check that your FROM_EMAIL is verified with your email provider');
        console.log('   5. Ensure your network allows outbound SMTP connections');
        console.log('   6. For SendGrid, make sure you are using "apikey" as the username');
        
        process.exit(1);
    }
}

// Run the test
testEmail().catch(console.error);