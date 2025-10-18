const TimerService = require('../services/timerService');
const nodeCron = require('node-cron');

// Clean up expired tokens every hour
nodeCron.schedule('0 * * * *', () => {
    console.log('🕐 Running scheduled token cleanup...');
    TimerService.cleanupExpiredTokens();
});

// Or run cleanup on server start
TimerService.cleanupExpiredTokens();