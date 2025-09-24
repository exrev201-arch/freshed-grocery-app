/**
 * Admin Storage Reset Script
 * This script clears the localStorage admin data so the app can recreate 
 * admin users with the correct role format (ADMIN instead of admin)
 */

console.log('🧹 Clearing admin storage to fix role mismatch...');

// Clear admin-related localStorage keys
const keysToRemove = [
    'fresh_backend_admin_users',
    'fresh-admin-storage'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
    } else {
        console.log(`ℹ️  Not found: ${key}`);
    }
});

console.log('✨ Storage cleared! The app will now create admin users with correct role format.');
console.log('🔄 Please refresh the page and try logging in as admin again.');
console.log('📧 Use: admin@fresh.co.tz');

// Force page reload to reinitialize with clean storage
setTimeout(() => {
    window.location.reload();
}, 1000);