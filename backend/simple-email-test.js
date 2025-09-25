const nodemailer = require('nodemailer');

// Use your exact credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'freshed38@gmail.com',
    pass: 'huxitdqocqfzlhf'
  }
});

async function testEmail() {
  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP server connection verified successfully!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"Freshed Grocery" <freshed38@gmail.com>',
      to: 'freshed38@gmail.com',
      subject: 'Test Email Configuration',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.response) {
      console.error(`   Response: ${error.response}`);
    }
  }
}

testEmail();