const express = require('express');
const QRVerificationService = require('../services/qrVerificationService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// All QR routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/qr/verify - Verify QR code at event entrance
router.post('/verify', async (req, res) => {
    try {
        const { crypticCode, scanLocation } = req.body;
        const adminId = req.user.userId;

        console.log(`🔍 QR verification request from admin: ${adminId}`);

        if (!crypticCode) {
            return res.status(400).json({
                success: false,
                error: 'Cryptic code is required'
            });
        }

        // Validate cryptic code format (should be 16 characters)
        if (typeof crypticCode !== 'string' || crypticCode.length !== 16) {
            return res.status(400).json({
                success: false,
                error: 'Invalid cryptic code format'
            });
        }

        const result = await QRVerificationService.verifyTicket(
            crypticCode, 
            adminId, 
            scanLocation
        );

        // Return appropriate HTTP status based on verification result
        const statusCode = result.success ? 200 : 
                          result.status === 'invalid' ? 404 : 
                          result.status === 'system_error' ? 500 : 409;

        res.status(statusCode).json({
            success: result.success,
            status: result.status,
            message: result.message,
            data: result.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('💥 QR verify endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'QR verification failed'
        });
    }
});

// GET /api/qr/scan-history - Get scan history for admin
router.get('/scan-history', async (req, res) => {
    try {
        const { ticketId, result, limit = 50 } = req.query;
        const adminId = req.user.userId;

        console.log(`📋 Scan history request from admin: ${adminId}`);

        const filters = {
            adminId: req.query.adminId || undefined, // Allow filtering by specific admin
            ticketId,
            result,
            limit: parseInt(limit)
        };

        const scanHistory = await QRVerificationService.getScanHistory(filters);

        res.json({
            success: true,
            data: scanHistory.data,
            total: scanHistory.data.length,
            filters: filters
        });

    } catch (error) {
        console.error('💥 Scan history endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scan history'
        });
    }
});

// GET /api/qr/ticket/:ticketId/scans - Get scan history for specific ticket
router.get('/ticket/:ticketId/scans', async (req, res) => {
    try {
        const { ticketId } = req.params;

        console.log(`🎫 Ticket scan history request for: ${ticketId}`);

        const result = await QRVerificationService.getTicketScanHistory(ticketId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            ticketId: ticketId,
            scans: result.data,
            totalScans: result.data.length
        });

    } catch (error) {
        console.error('💥 Ticket scan history endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket scan history'
        });
    }
});

// GET /api/qr/scanner - QR scanner interface data
router.get('/scanner', async (req, res) => {
    try {
        console.log(`📱 QR scanner interface request from admin: ${req.user.userId}`);

        // Return scanner configuration and recent activity
        const recentScans = await QRVerificationService.getScanHistory({ 
            limit: 10 
        });

        res.json({
            success: true,
            scanner: {
                adminId: req.user.userId,
                adminName: req.user.name || req.user.email,
                scannerActive: true,
                timestamp: new Date().toISOString()
            },
            recentActivity: recentScans.data,
            instructions: [
                'Scan QR code on ticket',
                'Green = Valid entry',
                'Red = Invalid/Used ticket',
                'Yellow = Revoked ticket'
            ]
        });

    } catch (error) {
        console.error('💥 Scanner interface endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load scanner interface'
        });
    }
});

module.exports = router;