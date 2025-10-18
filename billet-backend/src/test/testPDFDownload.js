const DownloadService = require('../services/downloadService');

const testPDFDownload = async () => {
    console.log('🧪 Testing PDF Download System');
    
    try {
        // You'll need a valid ticketId and token from your database
        const testTicketId = 'your-test-ticket-id';
        const testToken = 'your-test-token';
        
        console.log('📥 Testing PDF generation...');
        const pdfBytes = await DownloadService.generateTicketPDF(testTicketId, testToken);
        
        console.log('✅ PDF generated successfully');
        console.log('📊 PDF size:', pdfBytes.length, 'bytes');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
};

// testPDFDownload();