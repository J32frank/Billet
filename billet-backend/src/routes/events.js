const express = require('express');
const EventsService = require('../services/eventsService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const supabase = require('../config/database');
const router = express.Router();

// GET /api/events - Public/Seller access to events
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 Events route - User:', req.user);
        
        // Seller access - show ONLY their assigned event
        if (req.user.role === 'seller') {
            const supabase = require('../config/database');
            const { data: seller, error } = await supabase
                .from('sellers')
                .select(`
                    event_id,
                    events (
                        id,
                        name,
                        description,
                        event_date,
                        location,
                        max_capacity,
                        tickets_sold
                    )
                `)
                .eq('id', req.user.userId)
                .single();

            if (error || !seller) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller not found'
                });
            }

            return res.json({
                success: true,
                data: seller.events ? [seller.events] : []
            });
        }

        // Admin access - show events they created or are co-admin of
        const adminId = req.user.userId;
        console.log('🔍 Admin ID from token:', adminId);
        
        // Get events admin created
        const { data: createdEvents, error: createdError } = await supabase
            .from('events')
            .select('*')
            .eq('created_by', adminId);

        console.log('📊 Created events:', createdEvents, 'Error:', createdError);

        // Get events admin is co-admin of
        const { data: coAdminEvents, error: coAdminError } = await supabase
            .from('event_admins')
            .select(`
                events (*)
            `)
            .eq('admin_id', adminId);

        console.log('👥 Co-admin events:', coAdminEvents, 'Error:', coAdminError);

        // Combine events
        const adminEvents = [...(createdEvents || [])];
        if (coAdminEvents) {
            coAdminEvents.forEach(ea => {
                if (ea.events && !adminEvents.find(e => e.id === ea.events.id)) {
                    adminEvents.push(ea.events);
                }
            });
        }

        console.log('🎯 Final admin events:', adminEvents);

        res.json({
            success: true,
            data: adminEvents,
            total: adminEvents.length
        });

    } catch (error) {
        console.error('💥 Get events error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});

// POST /api/events - Create event (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const adminId = req.user.userId;
        console.log('🔍 Creating event for admin:', adminId);
        const result = await EventsService.createEvent(adminId, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
        
    } catch (error) {
        console.error('💥 Create event error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create event'
        });
    }
});

// GET /api/events/:eventId - Get specific event
router.get('/:eventId', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await EventsService.getEventById(eventId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('💥 Get event error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event'
        });
    }
});

// PUT /api/events/:eventId - Update event (Admin only)
router.put('/:eventId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await EventsService.updateEvent(eventId, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('💥 Update event error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update event'
        });
    }
});

// DELETE /api/events/:eventId - Delete event (Admin only)
router.delete('/:eventId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await EventsService.deleteEvent(eventId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('💥 Delete event error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event'
        });
    }
});

// GET /api/events/:eventId/stats - Get event statistics (Admin only)
router.get('/:eventId/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await EventsService.getEventStats(eventId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('💥 Event stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event stats'
        });
    }
});

// POST /api/events/:eventId/assign-seller - Assign seller to event (Admin only)
router.post('/:eventId/assign-seller', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { sellerId } = req.body;
        
        if (!sellerId) {
            return res.status(400).json({
                success: false,
                error: 'Seller ID is required'
            });
        }
        
        const result = await EventsService.assignSellerToEvent(eventId, sellerId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('💥 Assign seller error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign seller'
        });
    }
});

module.exports = router;