#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run this to verify your .env file is properly configured
 */

console.log('\n🔍 Checking Environment Variables...\n');

const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

let allPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'your_api_key_here' && value !== 'your_auth_domain_here') {
        console.log(`✅ ${varName}: Set`);
    } else {
        console.log(`❌ ${varName}: Missing or using placeholder value`);
        allPresent = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
    console.log('✅ All environment variables are properly configured!');
    console.log('You can now run: npm run dev');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\nPlease:');
    console.log('1. Create a .env file in the project root');
    console.log('2. Copy the contents from .env.example');
    console.log('3. Replace placeholder values with your actual Firebase credentials');
    console.log('\nSee SECURITY_FIX_README.md for detailed instructions.');
}

console.log('='.repeat(50) + '\n');
