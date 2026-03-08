require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Discord Music Bot System...\n');

// Start the Discord bot
const bot = spawn('node', [path.join(__dirname, 'bot', 'index.js')], {
    stdio: 'inherit',
    env: process.env
});

// Start the dashboard
const dashboard = spawn('node', [path.join(__dirname, 'dashboard', 'server.js')], {
    stdio: 'inherit',
    env: process.env
});

// Handle process errors
bot.on('error', (error) => {
    console.error('❌ Bot process error:', error);
});

dashboard.on('error', (error) => {
    console.error('❌ Dashboard process error:', error);
});

// Handle process exits
bot.on('exit', (code, signal) => {
    console.log(`⚠️ Bot process exited with code ${code} and signal ${signal}`);
    process.exit(code);
});

dashboard.on('exit', (code, signal) => {
    console.log(`⚠️ Dashboard process exited with code ${code} and signal ${signal}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    bot.kill();
    dashboard.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    bot.kill();
    dashboard.kill();
    process.exit(0);
});
