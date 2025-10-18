const express = require('express');
const { generateTicket, getTicketByCrypticCode } = require('../services/ticketService');
const { authenticateToken } = require('../middleware/auth');
const { validateGenerateTicket } = require('../middleware/validation');
const RegenerateService = require('../services/regenerateService');
const supabase = require('../config/database');
const router = express.Router();

// All ticket routes require seller authentication
router.use(authenticateToken);

// POST /api/tickets/generate - Generate new ticket
router.post('/generate', validateGenerateTicket, async (req, res) => {
    try {
        console.log('🔧 [POST /tickets/generate] Request received');
        console.log('🔧 [POST /tickets/generate] Body:', req.body);

        const { buyerName, buyerPhone, buyerEmail } = req.body;
        const sellerId = req.user.userId || req.user.useId;

        console.log('🔧 [POST /tickets/generate] Generating ticket for seller:', sellerId);

        // Check quota before generating ticket
        const SellerService = require('../services/sellerService');
        const quotaCheck = await SellerService.canSellTickets(sellerId);
        
        if (!quotaCheck.success) {
            return res.status(403).json({
                success: false,
                error: quotaCheck.error || 'Quota exceeded. Contact your administrator to add more tickets.'
            });
        }

        // Get seller's event
        const { data: seller, error: sellerError } = await supabase
            .from('sellers')
            .select('event_id, quota, tickets_sold')
            .eq('id', sellerId)
            .single();

        if (sellerError || !seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        // Double-check quota at database level
        if (seller.tickets_sold >= seller.quota) {
            return res.status(403).json({
                success: false,
                error: `You have used all ${seller.quota} of your allocated tickets. Please contact your administrator to request more tickets.`
            });
        }

        const eventId = seller.event_id;

        const ticketData = {
            sellerId,
            eventId,
            buyerName,
            buyerPhone,
            buyerEmail: buyerEmail || null
        };

        const result = await generateTicket(ticketData);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            message: 'Ticket generated successfully',
            data: result.data
        });

    } catch (error) {
        console.error('💥 [POST /tickets/generate] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate ticket'
        });
    }
});
// GET /api/tickets/verify/:crypticCode - Verify ticket (Public endpoint)
router.get('/verify/:crypticCode', async (req, res) => {
    try {
        console.log('🔧 [GET /tickets/verify] Verifying ticket:', req.params.crypticCode);

        const { crypticCode } = req.params;

        if (!crypticCode || crypticCode.length !== 16) {
            return res.status(400).json({
                success: false,
                error: 'Invalid cryptic code format'
            });
        }

        const result = await getTicketByCrypticCode(crypticCode);

        if (!result.success) {
            return res.status(404).json(result);
        }

        // Return ticket status for verification
        res.json({
            success: true,
            data: {
                ticketId: result.data.ticket_number,
                buyerName: result.data.buyer_name,
                event: result.data.events,
                status: result.data.status,
                generatedAt: result.data.generated_at
            }
        });

    } catch (error) {
        console.log('💥 [GET /tickets/verify] Route error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify ticket'
        });
    }
});

// GET /api/tickets/seller - Get seller's own tickets
router.get('/seller', async (req, res) => {
    try {
        // Handle both property names for backward compatibility
        const sellerId = req.user.userId || req.user.useId;
        console.log('🔧 [GET /tickets/seller] Fetching tickets for seller:', sellerId);

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select(`
                id,
                ticket_number,
                buyer_name,
                buyer_phone,
                ticket_price,
                status,
                generated_at,
                events (name, event_date)
            `)
            .eq('seller_id', sellerId)
            .order('generated_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: tickets
        });

    } catch (error) {
        console.log('💥 [GET /tickets/seller] Route error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller tickets'
        });
    }
});

// POST /api/tickets/regenerate-link
router.post('/regenerate-link', authenticateToken, async (req, res) => {
    try {
        const { ticketId, contactMethod, contactInfo } = req.body;
        
        const sellerId = req.user.userId || req.user.useId;
        
        if (!sellerId) {
            return res.status(401).json({
                success: false,
                error: 'Unable to identify seller from token'
            });
        }

        console.log('🔄 Regenerate link request:', { ticketId, sellerId, contactMethod });

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                error: 'Ticket ID is required'
            });
        }

        let result;

        if (contactMethod && contactInfo) {
            result = await RegenerateService.sendRegeneratedLink(
                ticketId, 
                sellerId, 
                contactMethod, 
                contactInfo
            );
        } else {
            result = await RegenerateService.regenerateDownloadLink(ticketId, sellerId);
        }

        console.log('✅ Link regenerated successfully for ticket:', ticketId);

        res.json({
            success: true,
            message: 'New download link generated successfully',
            data: {
                token: result.token,
                downloadUrl: result.downloadUrl,
                ticket: result.ticket
            }
        });

    } catch (error) {
        console.error('💥 Regenerate link endpoint error:', error);

        if (error.message.includes('permission') || error.message.includes('not found')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to regenerate download link'
        });
    }
});

// GET /api/tickets/:ticketId/download-links (Optional - view active links)
router.get('/:ticketId/download-links',  authenticateToken                , async (req, res) => {
    try {
        const { ticketId } = req.params;
        const sellerId = req.user.useId;

        console.log(`📋 Fetching active download links for ticket: ${ticketId}`);

        // Verify ownership first
        await RegenerateService.verifyTicketOwnership(ticketId, sellerId);

        // Get active tokens
        const DownloadTokenService = require('../services/downloadTokenService');
        const activeTokens = await DownloadTokenService.getActiveTokens(ticketId);

        const activeLinks = activeTokens.map(token => ({
            token: token.token,
            expiresAt: token.expires_at,
            timeRemaining: Math.max(0, Math.floor((new Date(token.expires_at) - new Date()) / 1000)),
            downloadUrl: `${process.env.FRONTEND_URL}/ticket/${ticketId}/${token.token}`
        }));

        res.json({
            success: true,
            data: {
                ticketId,
                activeLinks,
                totalActive: activeLinks.length
            }
        });

    } catch (error) {
        console.error('💥 Get download links error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch download links'
        });
    }
});

// GET /api/tickets/:ticketId/full-data - Get complete ticket data for frontend
router.get('/:ticketId/full-data', authenticateToken, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const sellerId = req.user.useId;

        console.log('🔧 Fetching full ticket data for frontend:', ticketId);

        const { data: ticket, error } = await supabase
            .from('tickets')
            .select(`
                *,
                events (*),
                sellers (*)
            `)
            .eq('id', ticketId)
            .eq('seller_id', sellerId)
            .single();

        if (error || !ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found or access denied'
            });
        }

        // Structure data for frontend ticket design
        const frontendData = {
            ticket: {
                id: ticket.id,
                number: ticket.ticket_number,
                buyerName: ticket.buyer_name,
                buyerPhone: ticket.buyer_phone,
                buyerEmail: ticket.buyer_email,
                price: ticket.ticket_price,
                crypticCode: ticket.cryptic_code,
                status: ticket.status,
                generatedAt: ticket.generated_at,
                qrCodeData: ticket.qr_code_data
            },
            event: {
                name: ticket.events.name,
                date: ticket.events.event_date,
                location: ticket.events.location,
                description: ticket.events.description
            },
            seller: {
                name: ticket.sellers.name,
                email: ticket.sellers.email
            },
            qrData: {
                ticketId: ticket.ticket_number,
                crypticCode: ticket.cryptic_code,
                eventId: ticket.event_id,
                timestamp: ticket.generated_at,
                ticketPrice: ticket.ticket_price
            }
        };

        res.json({
            success: true,
            data: frontendData,
            message: 'Ticket data retrieved successfully'
        });

    } catch (error) {
        console.error('💥 Full data endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket data'
        });
    }
});

const SellerService = require('../services/sellerService');

// GET /api/tickets/my-tickets - Get seller's tickets with filtering
router.get('/my-tickets', authenticateToken, async (req, res) => {
    try {
        const sellerId = req.user.useId;
        const { status, eventId, search, page = 1, limit = 20 } = req.query;

        console.log(`📋 Seller tickets request - Seller: ${sellerId}`, { status, eventId, search });

        const filters = {
            status,
            eventId, 
            search
        };

        const result = await SellerService.getSellerTickets(sellerId, filters);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Simple pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedTickets = result.data.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedTickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.data.length,
                totalPages: Math.ceil(result.data.length / limit)
            },
            filters: filters
        });

    } catch (error) {
        console.error('💥 My tickets endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller tickets'
        });
    }
});

// GET /api/tickets/my-tickets/stats - Get seller ticket statistics
router.get('/my-tickets/stats', authenticateToken, async (req, res) => {
    try {
        const sellerId = req.user.useId;

        console.log(`📊 Seller stats request - Seller: ${sellerId}`);

        const result = await SellerService.getSellerStats(sellerId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('💥 Seller stats endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller statistics'
        });
    }
});

module.exports = router;