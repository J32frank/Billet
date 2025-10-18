const express = require('express');
const AdminService = require('../services/adminService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/admin/sellers - Create new seller
router.post('/sellers', async (req, res) => {
    try {
        const adminId = req.user.userId;
        const result = await AdminService.createSeller(adminId, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
        
    } catch (error) {
        console.error('Create seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create seller'
        });
    }
});

// POST /api/admin/sellers/create - Create new seller (legacy route)
router.post('/sellers/create', async (req, res) => {
    try {
        const adminId = req.user.userId;
        const result = await AdminService.createSeller(adminId, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
        
    } catch (error) {
        console.error('Create seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create seller'
        });
    }
});

// GET /api/admin/sellers - Get all sellers
router.get('/sellers', async (req, res) => {
    try {
        const { isActive, eventId } = req.query;
        const filters = { isActive, eventId };
        
        const result = await AdminService.getAllSellers(filters);
        
        res.json({
            success: true,
            data: result.data,
            total: result.total,
            filters: filters
        });
        
    } catch (error) {
        console.error('Get sellers endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sellers'
        });
    }
});

// POST /api/admin/sellers/:sellerId/revoke - Revoke seller
router.post('/sellers/:sellerId/revoke', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.revokeSeller(adminId, sellerId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Revoke seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke seller'
        });
    }
});

// POST /api/admin/sellers/:sellerId/restore - Restore seller
router.post('/sellers/:sellerId/restore', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.restoreSeller(adminId, sellerId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Restore seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore seller'
        });
    }
});

// PUT /api/admin/sellers/:sellerId/quota - Update seller quota
router.put('/sellers/:sellerId/quota', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { quota } = req.body;
        const adminId = req.user.userId;
        
        if (!quota || quota < 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid quota is required'
            });
        }
        
        const result = await AdminService.updateSellerQuota(adminId, sellerId, quota);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Update quota endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update quota'
        });
    }
});

// GET /api/admin/dashboard - Admin dashboard overview
router.get('/dashboard', async (req, res) => {
    try {
        const adminId = req.user.userId;
        
        const result = await AdminService.getAdminDashboard(adminId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Admin dashboard endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard'
        });
    }
});

// GET /api/admin/all-tickets - Get all system tickets
router.get('/all-tickets', async (req, res) => {
    try {
        const { status, sellerId, eventId, limit } = req.query;
        const filters = { status, sellerId, eventId, limit };
        
        const result = await AdminService.getAllTickets(filters);
        
        res.json({
            success: true,
            data: result.data,
            total: result.total,
            filters: filters
        });
        
    } catch (error) {
        console.error('Get all tickets endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets'
        });
    }
});

// GET /api/admin/events - Get all events for admin
router.get('/events', async (req, res) => {
    try {
        const EventsService = require('../services/eventsService');
        const result = await EventsService.getAllEvents();
        
        res.json({
            success: true,
            data: result.data,
            total: result.total
        });
        
    } catch (error) {
        console.error('Get admin events endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});

// PUT /api/admin/sellers/:sellerId - Update seller details
router.put('/sellers/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.updateSeller(adminId, sellerId, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Update seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update seller'
        });
    }
});

// DELETE /api/admin/sellers/:sellerId - Delete seller
router.delete('/sellers/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.deleteSeller(adminId, sellerId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Delete seller endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete seller'
        });
    }
});

// GET /api/admin/sellers/:sellerId/tickets - Get seller tickets
router.get('/sellers/:sellerId/tickets', async (req, res) => {
    try {
        const { sellerId } = req.params;
        
        const result = await AdminService.getSellerTickets(sellerId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json({
            success: true,
            data: result.data,
            total: result.total,
            stats: result.stats
        });
        
    } catch (error) {
        console.error('Get seller tickets endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller tickets'
        });
    }
});

// POST /api/admin/tickets/:ticketId/revoke - Revoke specific ticket
router.post('/tickets/:ticketId/revoke', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.revokeTicket(adminId, ticketId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Revoke ticket endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke ticket'
        });
    }
});

// POST /api/admin/tickets/:ticketId/restore - Restore specific ticket
router.post('/tickets/:ticketId/restore', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const adminId = req.user.userId;
        
        const result = await AdminService.restoreTicket(adminId, ticketId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Restore ticket endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore ticket'
        });
    }
});

// Event Admin Management Routes
const EventAdminService = require('../services/eventAdminService');

// POST /api/admin/events/:eventId/admins - Add admin to event
router.post('/events/:eventId/admins', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { adminEmail } = req.body;
        const adminId = req.user.userId;
        
        const result = await EventAdminService.addAdminToEvent(eventId, adminEmail, adminId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Add event admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add admin to event'
        });
    }
});

// DELETE /api/admin/events/:eventId/admins/:adminId - Remove admin from event
router.delete('/events/:eventId/admins/:adminId', async (req, res) => {
    try {
        const { eventId, adminId: targetAdminId } = req.params;
        const adminId = req.user.userId;
        
        const result = await EventAdminService.removeAdminFromEvent(eventId, targetAdminId, adminId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Remove event admin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove admin from event'
        });
    }
});

// GET /api/admin/events/:eventId/admins - Get event admins
router.get('/events/:eventId/admins', async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const result = await EventAdminService.getEventAdmins(eventId);
        
        res.json({
            success: true,
            data: result.data,
            total: result.total
        });
        
    } catch (error) {
        console.error('Get event admins error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event admins'
        });
    }
});

// POST /api/admin/tickets/bulk-revoke - Bulk revoke tickets
router.post('/tickets/bulk-revoke', async (req, res) => {
    try {
        const { ticketIds } = req.body;
        const adminId = req.user.userId;
        
        if (!ticketIds || !Array.isArray(ticketIds)) {
            return res.status(400).json({
                success: false,
                error: 'Ticket IDs array is required'
            });
        }
        
        const results = await Promise.all(
            ticketIds.map(id => AdminService.revokeTicket(adminId, id))
        );
        
        res.json({
            success: true,
            data: results,
            message: `${results.filter(r => r.success).length} tickets revoked`
        });
        
    } catch (error) {
        console.error('Bulk revoke tickets error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke tickets'
        });
    }
});

// POST /api/admin/tickets/bulk-restore - Bulk restore tickets
router.post('/tickets/bulk-restore', async (req, res) => {
    try {
        const { ticketIds } = req.body;
        const adminId = req.user.userId;
        
        if (!ticketIds || !Array.isArray(ticketIds)) {
            return res.status(400).json({
                success: false,
                error: 'Ticket IDs array is required'
            });
        }
        
        const results = await Promise.all(
            ticketIds.map(id => AdminService.restoreTicket(adminId, id))
        );
        
        res.json({
            success: true,
            data: results,
            message: `${results.filter(r => r.success).length} tickets restored`
        });
        
    } catch (error) {
        console.error('Bulk restore tickets error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore tickets'
        });
    }
});

// GET /api/admin/tickets/export - Export tickets as CSV
router.get('/tickets/export', async (req, res) => {
    try {
        const { eventId, sellerId, status } = req.query;
        const filters = { eventId, sellerId, status };
        
        const result = await AdminService.getAllTickets(filters);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        // Convert to CSV
        const tickets = result.data;
        const csvHeader = 'Ticket Number,Buyer Name,Buyer Phone,Price,Status,Generated At,Seller,Event\n';
        const csvRows = tickets.map(ticket => 
            `${ticket.ticket_number},${ticket.buyer_name},${ticket.buyer_phone || ''},${ticket.ticket_price},${ticket.status},${ticket.generated_at},${ticket.sellers?.name || ''},${ticket.events?.name || ''}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tickets.csv');
        res.send(csvHeader + csvRows);
        
    } catch (error) {
        console.error('Export tickets error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export tickets'
        });
    }
});

// POST /api/admin/create-admin - Create new admin account
router.post('/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const adminId = req.user.userId;
        
        const result = await AdminService.createAdmin(adminId, { name, email, password });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
        
    } catch (error) {
        console.error('Create admin endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create admin'
        });
    }
});

module.exports = router;