const express = require('express');
const DownloadService = require('../services/downloadService');
const TimerService = require('../services/timerService');
const DownloadTokenService = require('../services/downloadTokenService');
const supabase = require('../config/database');
const router = express.Router();

// GET /api/public/download/:ticketId/:token - Download PNG ticket
router.get('/download/:ticketId/:token', async (req, res) => {
    try {
        const { ticketId, token } = req.params;
        
        console.log(`🖼️ PNG download request for ticket: ${ticketId}, token: ${token}`);
        
        // Generate PNG image
        const imageBytes = await DownloadService.generateTicketImage(ticketId, token);
        
        // Set response headers for PNG download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticketId}.png"`);
        res.setHeader('Content-Length', imageBytes.length);
        
        console.log('✅ PNG sent successfully');
        res.send(imageBytes);
        
    } catch (error) {
        console.error('💥 PNG download endpoint error:', error);
        
        if (error.message.includes('expired') || error.message.includes('used') || error.message.includes('Invalid')) {
            return res.status(410).json({ // 410 Gone
                success: false,
                error: 'Download link has expired or has been used',
                code: 'LINK_EXPIRED'
            });
        }
        
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found',
                code: 'TICKET_NOT_FOUND'
            });
        }
        
        if (error.message.includes('Token does not match')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid download link',
                code: 'INVALID_LINK'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to generate ticket image',
            code: 'IMAGE_GENERATION_ERROR'
        });
    }
});

// GET /api/public/timer/:token - Get remaining time for download (using TimerService)
router.get('/timer/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log(`⏰ Timer status request for token: ${token}`);
        
        const tokenStatus = await TimerService.getTokenStatus(token);
        
        // Return appropriate status code based on token validity
        if (!tokenStatus.valid) {
            return res.status(410).json({ // 410 Gone
                success: false,
                ...tokenStatus,
                message: tokenStatus.isUsed ? 
                    'This download link has already been used' :
                    'This download link has expired'
            });
        }
        
        res.json({
            success: true,
            ...tokenStatus,
            message: 'Download link is valid'
        });
        
    } catch (error) {
        console.error('💥 Timer endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check timer status',
            valid: false,
            isExpired: true,
            isUsed: true
        });
    }
});

// GET /api/public/timer/:token/formatted - Get formatted time remaining
router.get('/timer/:token/formatted', async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log(`⏰ Formatted timer request for token: ${token}`);
        
        const formattedTime = await TimerService.getFormattedTimeRemaining(token);
        
        if (!formattedTime.valid) {
            return res.status(410).json({
                success: false,
                ...formattedTime
            });
        }
        
        res.json({
            success: true,
            ...formattedTime
        });
        
    } catch (error) {
        console.error('💥 Formatted timer error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Error checking time remaining'
        });
    }
});

// GET /api/public/timer/:token/validate - Strict validation for downloads
router.get('/timer/:token/validate', async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log(`🔒 Strict validation for token: ${token}`);
        
        const validation = await TimerService.validateTokenForDownload(token);
        
        res.json({
            success: true,
            valid: true,
            timeRemaining: validation.timeRemaining,
            expiresAt: validation.expiresAt,
            ticket: validation.ticket
        });
        
    } catch (error) {
        console.error('❌ Token validation failed:', error);
        res.status(410).json({
            success: false,
            valid: false,
            error: error.message
        });
    }
});

// GET /api/public/ticket/:ticketId/:token/info - Get basic ticket info (for display)
router.get('/ticket/:ticketId/:token/info', async (req, res) => {
    try {
        const { ticketId, token } = req.params;
        
        console.log(`ℹ️  Ticket info request for: ${ticketId}`);
        
        // Validate token first
        const tokenValidation = await DownloadTokenService.validateToken(token, ticketId);
        if (!tokenValidation.valid) {
            return res.status(410).json({
                success: false,
                error: tokenValidation.error,
                code: 'INVALID_TOKEN'
            });
        }
        
        // Get ticket details
        const { data: ticket, error } = await supabase
            .from('tickets')
            .select(`
                ticket_number,
                buyer_name,
                buyer_phone,
                ticket_price,
                generated_at,
                cryptic_code,
                events (
                    name,
                    event_date,
                    location
                ),
                sellers (
                    name
                )
            `)
            .eq('id', ticketId)
            .single();
        
        if (error || !ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found',
                code: 'TICKET_NOT_FOUND'
            });
        }
        
        // Calculate time remaining
        const expiresAt = new Date(tokenValidation.tokenData.expires_at);
        const timeRemaining = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
        
        res.json({
            success: true,
            data: {
                ticket: {
                    number: ticket.ticket_number,
                    buyer: ticket.buyer_name,
                    phone: ticket.buyer_phone,
                    price: ticket.ticket_price,
                    generated: ticket.generated_at,
                    cryptic_code: ticket.cryptic_code
                },
                event: ticket.events,
                seller: ticket.sellers,
                download: {
                    timeRemaining,
                    expiresAt: tokenValidation.tokenData.expires_at,
                    isExpiringSoon: timeRemaining < 300 // 5 minutes
                }
            }
        });
        
    } catch (error) {
        console.error('💥 Ticket info endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve ticket information'
        });
    }
});

// GET /api/public/health - Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Test database connection
        const { data, error } = await supabase
            .from('download_tokens')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Download service is healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
        
    } catch (error) {
        console.error('💥 Health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Download service is unhealthy',
            error: error.message
        });
    }
});

// DEBUG: Check token-ticket relationship
router.get('/debug/token-ticket/:ticketId/:token', async (req, res) => {
    try {
        const { ticketId, token } = req.params;
        
        console.log(`🔍 DEBUG - Checking token-ticket relationship`);
        
        const DownloadService = require('../services/downloadService');
        const debugInfo = await DownloadService.debugTokenTicketRelationship(token, ticketId);
        
        res.json({
            success: true,
            ...debugInfo
        });
        
    } catch (error) {
        console.error('💥 Token-ticket debug error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;