const express = require('express');
const ShareService = require('../services/shareService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
// POST /api/share/send-link - Share ticket via various methods
router.post('/send-link', authenticateToken, async (req, res) => {
    try {
        // DEBUG: Log everything about the request
        console.log('🔍 DEBUG - Content-Type:', req.headers['content-type']);
        console.log('🔍 DEBUG - Raw request body:', req.body);
        console.log('🔍 DEBUG - Body type:', typeof req.body);
        console.log('🔍 DEBUG - Body keys:', Object.keys(req.body || {}));
        console.log('🔍 DEBUG - Request method:', req.method);
        console.log('🔍 DEBUG - Request URL:', req.url);

        const { ticketId, contactMethod, contactInfo, customMessage } = req.body;
        const sellerId = req.user.useId;

        console.log('📤 Share request:', { 
            ticketId, 
            sellerId, 
            contactMethod, 
            contactInfo,
            bodyExists: !!req.body,
            bodyKeys: Object.keys(req.body || {})
        });

        // Validate required fields with detailed error
        if (!ticketId || !contactMethod || !contactInfo) {
            return res.status(400).json({
                success: false,
                error: 'Ticket ID, contact method, and contact info are required',
                debug: {
                    receivedBody: req.body,
                    extracted: { ticketId, contactMethod, contactInfo },
                    bodyKeys: Object.keys(req.body || {}),
                    contentType: req.headers['content-type'],
                    method: req.method,
                    url: req.url
                }
            });
        }

        // Validate contact method
        const validMethods = ['email', 'whatsapp', 'sms'];
        if (!validMethods.includes(contactMethod.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid contact method. Use: email, whatsapp, or sms'
            });
        }

        const result = await ShareService.sendTicketLink(
            ticketId, 
            sellerId, 
            contactMethod, 
            contactInfo, 
            customMessage
        );

        res.json({
            success: true,
            message: `Ticket sent via ${contactMethod}`,
            data: result
        });

    } catch (error) {
        console.error('💥 Share endpoint error:', error);

        if (error.message.includes('permission') || error.message.includes('not found')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Unsupported share method')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to share ticket'
        });
    }
});

// GET /api/share/methods - Get available share methods
router.get('/methods', authenticateToken, async (req, res) => {
    try {
        const shareMethods = [
            {
                id: 'email',
                name: 'Email',
                description: 'Send ticket via email with beautiful template',
                icon: '📧',
                requires: 'email address',
                maxLength: null
            },
            {
                id: 'whatsapp', 
                name: 'WhatsApp',
                description: 'Share ticket via WhatsApp message',
                icon: '📱',
                requires: 'phone number with WhatsApp',
                maxLength: null
            },
            {
                id: 'sms',
                name: 'SMS',
                description: 'Send ticket via SMS text message',
                icon: '💬',
                requires: 'phone number',
                maxLength: 160
            }
        ];

        res.json({
            success: true,
            data: shareMethods
        });

    } catch (error) {
        console.error('💥 Share methods endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch share methods'
        });
    }
});

// POST /api/share/test-email - Test email service (development only)
router.post('/test-email', authenticateToken, async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                error: 'Test endpoint only available in development'
            });
        }

        console.log('🧪 Testing email service...');

        const result = await ShareService.testShareService();

        res.json(result);

    } catch (error) {
        console.error('💥 Email test endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;