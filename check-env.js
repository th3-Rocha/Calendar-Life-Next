#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Run this script to validate your .env.local configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env.local file not found!');
  console.log('\n📝 Create a .env.local file with the following variables:');
  console.log(`
SITE_PASSWORD="your-password"
NEXT_PUBLIC_DRIVE_ROOT_ID="your-drive-folder-id"
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour-Key\\n-----END PRIVATE KEY-----\\n"
  `);
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

let hasErrors = false;
let hasWarnings = false;

// Check SITE_PASSWORD
console.log('1️⃣  Checking SITE_PASSWORD...');
if (!process.env.SITE_PASSWORD) {
  console.error('   ❌ NOT SET - You need to set a password for site authentication');
  hasErrors = true;
} else if (process.env.SITE_PASSWORD === 'test123') {
  console.warn('   ⚠️  Using default password "test123" - Consider changing this for security');
  hasWarnings = true;
} else {
  console.log('   ✅ SET');
}

// Check NEXT_PUBLIC_DRIVE_ROOT_ID
console.log('\n2️⃣  Checking NEXT_PUBLIC_DRIVE_ROOT_ID...');
if (!process.env.NEXT_PUBLIC_DRIVE_ROOT_ID) {
  console.error('   ❌ NOT SET');
  hasErrors = true;
} else if (process.env.NEXT_PUBLIC_DRIVE_ROOT_ID.includes('your-folder')) {
  console.error('   ❌ PLACEHOLDER VALUE - Replace with your actual Google Drive folder ID');
  console.log('   💡 How to get it:');
  console.log('      1. Open your Google Drive folder');
  console.log('      2. Look at the URL: https://drive.google.com/drive/folders/XXXXX');
  console.log('      3. Copy the XXXXX part');
  hasErrors = true;
} else {
  console.log('   ✅ SET:', process.env.NEXT_PUBLIC_DRIVE_ROOT_ID);
}

// Check GOOGLE_CLIENT_EMAIL
console.log('\n3️⃣  Checking GOOGLE_CLIENT_EMAIL...');
if (!process.env.GOOGLE_CLIENT_EMAIL) {
  console.error('   ❌ NOT SET');
  hasErrors = true;
} else if (process.env.GOOGLE_CLIENT_EMAIL.includes('your-email') ||
           process.env.GOOGLE_CLIENT_EMAIL.includes('your-service-account')) {
  console.error('   ❌ PLACEHOLDER VALUE - Replace with your actual service account email');
  console.log('   💡 How to get it:');
  console.log('      1. Go to https://console.cloud.google.com/');
  console.log('      2. Navigate to "IAM & Admin" → "Service Accounts"');
  console.log('      3. Create a service account');
  console.log('      4. Copy the email (ends with .iam.gserviceaccount.com)');
  hasErrors = true;
} else if (!process.env.GOOGLE_CLIENT_EMAIL.includes('.iam.gserviceaccount.com')) {
  console.error('   ❌ INVALID FORMAT - Should end with .iam.gserviceaccount.com');
  hasErrors = true;
} else {
  console.log('   ✅ SET:', process.env.GOOGLE_CLIENT_EMAIL);
}

// Check GOOGLE_PRIVATE_KEY
console.log('\n4️⃣  Checking GOOGLE_PRIVATE_KEY...');
if (!process.env.GOOGLE_PRIVATE_KEY) {
  console.error('   ❌ NOT SET');
  hasErrors = true;
} else if (process.env.GOOGLE_PRIVATE_KEY.includes('your-key-here') ||
           process.env.GOOGLE_PRIVATE_KEY.includes('Your-Key-Here')) {
  console.error('   ❌ PLACEHOLDER VALUE - Replace with your actual private key');
  console.log('   💡 How to get it:');
  console.log('      1. In Google Cloud Console, go to your service account');
  console.log('      2. Go to "Keys" tab');
  console.log('      3. Click "Add Key" → "Create new key" → JSON');
  console.log('      4. Open the downloaded JSON file');
  console.log('      5. Copy the "private_key" value (keep the \\n characters!)');
  hasErrors = true;
} else if (!process.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
  console.error('   ❌ INVALID FORMAT - Should start with -----BEGIN PRIVATE KEY-----');
  hasErrors = true;
} else if (!process.env.GOOGLE_PRIVATE_KEY.includes('\\n')) {
  console.warn('   ⚠️  WARNING - Private key might be missing \\n escape sequences');
  console.log('   💡 The key should contain literal \\n characters (not actual newlines)');
  hasWarnings = true;
  console.log('   ✅ SET (length:', process.env.GOOGLE_PRIVATE_KEY.length, 'characters)');
} else {
  console.log('   ✅ SET (length:', process.env.GOOGLE_PRIVATE_KEY.length, 'characters)');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('\n❌ CONFIGURATION HAS ERRORS - Fix the issues above');
  console.log('\n📚 For detailed setup instructions, see:');
  console.log('   - README_SETUP.md');
  console.log('   - INSTALL.md');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  CONFIGURATION HAS WARNINGS - Review the warnings above');
  console.log('\n✅ You can try running the app, but be aware of potential issues');
  process.exit(0);
} else {
  console.log('\n✅ ALL ENVIRONMENT VARIABLES ARE CONFIGURED!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Make sure you shared the Google Drive folder with your service account');
  console.log('      Share with:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:3000');
  console.log('   4. Login with password:', process.env.SITE_PASSWORD);
  process.exit(0);
}
