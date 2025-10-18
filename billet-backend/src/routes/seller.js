const express = require('express');
const SellerService = require('../services/sellerService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All seller routes require authentication
router.use(authenticateToken);

// GET /api/seller/profile - Get seller profile
router.get('/profile', async (req, res) => {
    try {
        const sellerId = req.user.userId;

        console.log(`👤 Seller profile request - Seller: ${sellerId}`);

        const result = await SellerService.getSellerProfile(sellerId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('💥 Seller profile endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller profile'
        });
    }
});

// PUT /api/seller/profile - Update seller profile
router.put('/profile', async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const updateData = req.body;

        console.log(`✏️ Update seller profile - Seller: ${sellerId}`, updateData);

        const result = await SellerService.updateSellerProfile(sellerId, updateData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            message: result.message
        });

    } catch (error) {
        console.error('💥 Update seller profile endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update seller profile'
        });
    }
});

// GET /api/seller/quota-status - Get seller quota status
router.get('/quota-status', async (req, res) => {
    try {
        const sellerId = req.user.userId;

        console.log(`📈 Quota status request - Seller: ${sellerId}`);

        const result = await SellerService.getSellerStats(sellerId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result.data.quota
        });

    } catch (error) {
        console.error('💥 Quota status endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch quota status'
        });
    }
});

// GET /api/seller/event - Get seller's assigned event
router.get('/event', async (req, res) => {
    try {
        const sellerId = req.user.userId || req.user.useId;
        
        console.log(`🎫 Seller event request - Seller: ${sellerId}`);
        
        const supabase = require('../config/database');
        const { data: seller, error } = await supabase
            .from('sellers')
            .select(`
                event_id,
                events (*)
            `)
            .eq('id', sellerId)
            .single();
            
        if (error || !seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }
        
        res.json({
            success: true,
            data: seller.events
        });
        
    } catch (error) {
        console.error('💥 Seller event endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller event'
        });
    }
});

// GET /api/seller/tickets - Get seller's tickets
router.get('/tickets', async (req, res) => {
    try {
        const sellerId = req.user.userId || req.user.useId;
        
        console.log(`🎫 Seller tickets request - Seller: ${sellerId}`);
        
        const result = await SellerService.getSellerTickets(sellerId);
        
        res.json({
            success: true,
            data: result.data || []
        });
        
    } catch (error) {
        console.error('💥 Seller tickets endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets'
        });
    }
});

// GET /api/seller/dashboard - Complete seller dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const sellerId = req.user.userId || req.user.useId;

        console.log(`📊 Seller dashboard request - Seller: ${sellerId}`);

        // Get seller's assigned event first
        const supabase = require('../config/database');
        const { data: seller } = await supabase
            .from('sellers')
            .select(`
                event_id,
                events (*)
            `)
            .eq('id', sellerId)
            .single();

        // Get dashboard stats
        const statsResult = await SellerService.getSellerStats(sellerId);
        
        res.json({
            success: true,
            data: {
                myStats: statsResult.success ? statsResult.data : null,
                assignedEvent: seller?.events || null
            }
        });

    } catch (error) {
        console.error('💥 Seller dashboard endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard'
        });
    }
});

// GET /api/seller/tickets - Get seller's tickets
router.get('/tickets', async (req, res) => {
    try {
        const sellerId = req.user.userId || req.user.useId;
        const filters = {
            status: req.query.status,
            eventId: req.query.eventId,
            search: req.query.search
        };

        console.log(`🎫 Seller tickets request - Seller: ${sellerId}`);

        const result = await SellerService.getSellerTickets(sellerId, filters);
        
        res.json({
            success: true,
            data: result.data,
            total: result.total
        });

    } catch (error) {
        console.error('💥 Seller tickets endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load tickets'
        });
    }
});

module.exports = router;