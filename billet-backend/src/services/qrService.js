const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        console.log("Generating QR code for data: ", data);
        const qrContent = JSON.stringify(data);
        console.log('QR Content: ', qrContent);

        const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
            width: 300,
            height: 300, // Made it square as QR codes are typically square
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrection: 'H'
        });
        console.log('QR Code generated successfully.');
        console.log('QR data URL length: ', qrCodeDataURL.length);

        return qrCodeDataURL;

    } catch (error) {
        console.log('Error: ', error.message);
        throw new Error(`QR Code generation failed: ${error.message}`);
    }
}

const generateQrCodeSVG = async (data) => {
    try {
        const qrContent = JSON.stringify(data);
        // Use toString for SVG generation
        const qrCodeSVG = await QRCode.toString(qrContent, {
            type: 'svg',
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            }
        });
        return qrCodeSVG;
    } catch (error) {
        throw new Error(`SVG QR code generation failed: ${error.message}`);
    }
};

// ✅ UPDATED: Added ticketPrice to required fields
const validateQRData = (data) => {
    const requiredFields = ['ticketId', 'crypticCode', 'eventId', 'timestamp', 'ticketPrice'];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (isNaN(new Date(data.timestamp).getTime())) {
        throw new Error('Invalid timestamp format in QR Data');
    }

    // ✅ NEW: Validate ticket price format
    if (isNaN(parseFloat(data.ticketPrice)) || parseFloat(data.ticketPrice) < 0) {
        throw new Error('Invalid ticket price format in QR Data');
    }

    return true;
}

const parseQRContent = (qrContent) => {
    try {
        const parsedData = JSON.parse(qrContent);
        validateQRData(parsedData);
        return parsedData;
    } catch (error) {
        throw new Error(`Unable to parse QR Content: ${error.message}`);
    }
}

// ✅ UPDATED: Test data now includes ticketPrice
const testQRGeneration = async () => {
    const testData = {
        ticketId: 'TKT-20241201-ABC12',
        crypticCode: 'X7K9P2M8Q3N5R158',
        eventId: 'test-event-uuid',
        timestamp: new Date().toISOString(),
        ticketPrice: 25.50 // ✅ Added ticket price
    };

    try {
        const qrCode = await generateQRCode(testData);
        console.log('Test QR Code generated successfully.');
        
        // Test parsing as well
        const parsedData = parseQRContent(JSON.stringify(testData));
        console.log('Test QR Data parsed successfully:', parsedData);
        
        return qrCode;
    } catch (error) {
        console.log('Test QR Code generation failed: ' + error.message);
        return null;
    }
}

// ✅ NEW: Utility function to verify QR data structure matches ticket
const verifyQRDataStructure = (qrData, ticketData) => {
    const requiredMatch = ['ticketId', 'crypticCode', 'eventId', 'ticketPrice'];
    const mismatches = [];

    requiredMatch.forEach(field => {
        if (qrData[field] !== ticketData[field]) {
            mismatches.push(`${field}: QR(${qrData[field]}) ≠ Ticket(${ticketData[field]})`);
        }
    });

    if (mismatches.length > 0) {
        throw new Error(`QR data mismatch: ${mismatches.join(', ')}`);
    }

    return true;
}

module.exports = {
    generateQRCode,
    generateQrCodeSVG,
    validateQRData,
    parseQRContent,
    testQRGeneration,
    verifyQRDataStructure // ✅ Export new verification function
};