const crypto = require('crypto');

// Generate unique ticket number: TKT-YYYYMMDD-XXXXX
const generateTicketNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5); // 5 chars

    return `TKT-${dateStr}-${randomStr}`;
};

// Generate 16-character cryptic code for QR
const generateCrypticCode = () => {
    return crypto.randomBytes(12).toString('hex').toUpperCase().slice(0, 16);
};

// Validate ticket number format
const isValidTicketNumber = (ticketNumber) => {
    const pattern = /^TKT-\d{8}-[A-Z0-9]{5}$/;
    return pattern.test(ticketNumber);
};

// Validate cryptic code format
const isValidCrypticCode = (crypticCode) => {
    return crypticCode && crypticCode.length === 16 && /^[A-Z0-9]+$/.test(crypticCode);
};

module.exports = {
    generateTicketNumber,
    generateCrypticCode,
    isValidTicketNumber,
    isValidCrypticCode
};