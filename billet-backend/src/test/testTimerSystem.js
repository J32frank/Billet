const TimerService = require('../services/timerService');

const testTimerSystem = async () => {
    console.log('🧪 Testing Timer System');
    console.log('='.repeat(40));
    
    try {
        // Test with a valid token (you'll need to create one first)
        const testToken = 'your-test-token-here';
        
        console.log('1. Testing token status check...');
        const status = await TimerService.getTokenStatus(testToken);
        console.log('📊 Token Status:', {
            valid: status.valid,
            timeRemaining: status.timeRemaining,
            isExpired: status.isExpired,
            isUsed: status.isUsed
        });
        
        console.log('2. Testing formatted time...');
        const formatted = await TimerService.getFormattedTimeRemaining(testToken);
        console.log('⏰ Formatted Time:', formatted);
        
        console.log('3. Testing strict validation...');
        try {
            const validation = await TimerService.validateTokenForDownload(testToken);
            console.log('✅ Strict validation passed');
        } catch (error) {
            console.log('❌ Strict validation failed:', error.message);
        }
        
        console.log('4. Testing cleanup...');
        await TimerService.cleanupExpiredTokens();
        console.log('✅ Cleanup completed');
        
        console.log('🎉 Timer system tests completed!');
        
    } catch (error) {
        console.log('💥 Timer test failed:', error.message);
    }
};

// testTimerSystem();