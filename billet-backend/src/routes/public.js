const express = require('express');
const PublicTicketService = require('../services/publicTicketService');
const router = express.Router();

// No authentication required for public routes

// GET /api/public/ticket/:ticketId/:token - View ticket with countdown timer
router.get('/ticket/:ticketId/:token', async (req, res) => {
    try {
        const { ticketId, token } = req.params;

        console.log(`🎫 Public ticket view: ${ticketId}`);

        if (!ticketId || !token) {
            return res.status(400).json({
                success: false,
                error: 'Ticket ID and token are required'
            });
        }

        const result = await PublicTicketService.getTicketByToken(ticketId, token);

        if (!result.success) {
            const statusCode = result.expired ? 410 : 404; // 410 = Gone (expired)
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                expired: result.expired || false
            });
        }

        // Return ticket data with timer information
        res.json({
            success: true,
            data: result.data,
            message: 'Ticket accessed successfully'
        });

    } catch (error) {
        console.error('💥 Public ticket view error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load ticket'
        });
    }
});

// GET /api/public/download/:ticketId/:token - Download PDF ticket
router.get('/download/:ticketId/:token', async (req, res) => {
    try {
        const { ticketId, token } = req.params;

        console.log(`📥 Public download request: ${ticketId}`);

        if (!ticketId || !token) {
            return res.status(400).json({
                success: false,
                error: 'Ticket ID and token are required'
            });
        }

        const result = await PublicTicketService.downloadTicket(ticketId, token);

        if (!result.success) {
            const statusCode = result.expired ? 410 : 404;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                expired: result.expired || false
            });
        }

        // Set headers for PDF download
        res.setHeader('Content-Type', result.data.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.data.fileName}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send PDF buffer
        res.send(result.data.pdfBuffer);

    } catch (error) {
        console.error('💥 Public download error:', error);
        res.status(500).json({
            success: false,
            error: 'Download failed'
        });
    }
});

// GET /api/public/timer/:token - Check remaining time for token
router.get('/timer/:token', async (req, res) => {
    try {
        const { token } = req.params;

        console.log(`⏱️ Timer check for token: ${token}`);

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        const result = await PublicTicketService.getTimerStatus(token);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            data: result.data,
            message: `Timer status: ${result.data.status}`
        });

    } catch (error) {
        console.error('💥 Timer check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check timer'
        });
    }
});

// GET /api/public/validate/:ticketId/:token - Quick validation (for frontend)
router.get('/validate/:ticketId/:token', async (req, res) => {
    try {
        const { ticketId, token } = req.params;

        console.log(`✅ Validation check: ${ticketId}`);

        const result = await PublicTicketService.validatePublicAccess(ticketId, token);

        res.json({
            success: true,
            valid: result.valid,
            expired: result.expired,
            error: result.error
        });

    } catch (error) {
        console.error('💥 Validation error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            error: 'Validation failed'
        });
    }
});

// GET /api/public/health - Health check for public endpoints
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Public Ticket Access',
        status: 'operational',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;