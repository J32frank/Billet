const { testQRGeneration } = require('../services/qrService');
const express = require('express');
const router = express.Router();



// Test QR code generation
router.get('/qr-test', async (req, res) => {
    try {
        const qrCode = await testQRGeneration();

        if (qrCode) {
            res.json({
                success: true,
                message: 'QR code generated successfully',
                qrCode: qrCode // Base64 image data
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'QR code generation failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;