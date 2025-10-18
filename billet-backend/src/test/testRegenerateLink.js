const RegenerateService = require('../services/regenerateService');

const testRegenerateLink = async () => {
    console.log('🧪 Testing Regenerate Link System');
    
    try {
        const testTicketId = 'your-test-ticket-id';
        const testSellerId = 'your-test-seller-id';
        
        console.log('1. Testing basic link regeneration...');
        const result1 = await RegenerateService.regenerateDownloadLink(testTicketId, testSellerId);
        console.log('✅ Basic regeneration:', result1.downloadUrl);
        
        console.log('2. Testing regeneration with WhatsApp...');
        const result2 = await RegenerateService.sendRegeneratedLink(
            testTicketId, 
            testSellerId, 
            'whatsapp', 
            '+1234567890'
        );
        console.log('✅ WhatsApp regeneration:', result2.sentTo);
        
        console.log('🎉 All regenerate link tests passed!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
};

// testRegenerateLink();