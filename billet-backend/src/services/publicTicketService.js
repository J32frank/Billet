const supabase = require('../config/database');
const DownloadTokenService = require('./downloadTokenService');

class PublicTicketService {
    // Get ticket info for display on public download page
    static async getTicketInfoByToken(ticketId, token) {
        try {
            console.log(`ℹ️  Ticket info request for: ${ticketId}`);
            
            // Validate token first
            const tokenValidation = await DownloadTokenService.validateToken(token, ticketId);
            if (!tokenValidation.valid) {
                return {
                    success: false,
                    error: tokenValidation.error,
                    code: 'INVALID_TOKEN',
                    statusCode: 410
                };
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
                return {
                    success: false,
                    error: 'Ticket not found',
                    code: 'TICKET_NOT_FOUND',
                    statusCode: 404
                };
            }
            
            // Calculate time remaining
            const expiresAt = new Date(tokenValidation.tokenData.expires_at);
            const timeRemaining = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
            
            return {
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
            };
            
        } catch (error) {
            console.error('💥 Ticket info endpoint error:', error);
            return {
                success: false,
                error: 'Failed to retrieve ticket information',
                statusCode: 500
            };
        }
    }
    
    static async getTicketByToken(ticketId, token) {
        try {
            console.log(`🎫 Public ticket access: ${ticketId} with token: ${token}`);

            // Verify download token
            const tokenResult = await DownloadTokenService.verifyDownloadToken(ticketId, token);
            if (!tokenResult.success) {
                return {
                    success: false,
                    error: tokenResult.error,
                    expired: tokenResult.expired || false
                };
            }

            // Get ticket details
            const { data: ticket, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    buyer_name,
                    buyer_phone,
                    buyer_email,
                    ticket_price,
                    cryptic_code,
                    status,
                    generated_at,
                    qr_code_data,
                    events (
                        id,
                        name,
                        event_date,
                        location,
                        description
                    ),
                    sellers (
                        name,
                        email
                    )
                `)
                .eq('id', ticketId)
                .single();

            if (error || !ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            // Calculate remaining time
            const remainingTime = Math.max(0, Math.floor((new Date(tokenResult.data.expiresAt) - new Date()) / 1000));

            return {
                success: true,
                data: {
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
                        id: ticket.events.id,
                        name: ticket.events.name,
                        date: ticket.events.event_date,
                        location: ticket.events.location,
                        description: ticket.events.description
                    },
                    seller: {
                        name: ticket.sellers.name,
                        email: ticket.sellers.email
                    },
                    access: {
                        token: token,
                        expiresAt: tokenResult.data.expiresAt,
                        remainingSeconds: remainingTime,
                        remainingMinutes: Math.floor(remainingTime / 60),
                        isExpired: remainingTime <= 0
                    }
                }
            };

        } catch (error) {
            console.error('💥 Public ticket access error:', error);
            return {
                success: false,
                error: 'Failed to access ticket'
            };
        }
    }

    static async getTimerStatus(token) {
        try {
            console.log(`⏱️ Timer status check for token: ${token}`);

            const { data: tokenData, error } = await supabase
                .from('download_tokens')
                .select('expires_at, is_used, ticket_id')
                .eq('token', token)
                .single();

            if (error || !tokenData) {
                return {
                    success: false,
                    error: 'Invalid token'
                };
            }

            const now = new Date();
            const expiresAt = new Date(tokenData.expires_at);
            const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
            const isExpired = remainingSeconds <= 0 || tokenData.is_used;

            return {
                success: true,
                data: {
                    token: token,
                    ticketId: tokenData.ticket_id,
                    expiresAt: tokenData.expires_at,
                    remainingSeconds: remainingSeconds,
                    remainingMinutes: Math.floor(remainingSeconds / 60),
                    isExpired: isExpired,
                    isUsed: tokenData.is_used,
                    status: isExpired ? 'expired' : 'active'
                }
            };

        } catch (error) {
            console.error('💥 Timer status error:', error);
            return {
                success: false,
                error: 'Failed to check timer status'
            };
        }
    }

    static async downloadTicket(ticketId, token) {
        try {
            console.log(`📥 Download request: ${ticketId} with token: ${token}`);

            // Verify token and get ticket data
            const ticketResult = await this.getTicketByToken(ticketId, token);
            if (!ticketResult.success) {
                return ticketResult;
            }

            // Check if token is expired
            if (ticketResult.data.access.isExpired) {
                return {
                    success: false,
                    error: 'Download link has expired',
                    expired: true
                };
            }

            // Skip marking token as used for now (allows multiple downloads within time limit)

            // Generate PDF (you'll need to implement this in pdfService)
            const PDFService = require('./pdfService');
            const pdfResult = await PDFService.generateTicketPDF(ticketResult.data);

            if (!pdfResult.success) {
                return {
                    success: false,
                    error: 'Failed to generate PDF'
                };
            }

            return {
                success: true,
                data: {
                    ticketId: ticketId,
                    fileName: `ticket-${ticketResult.data.ticket.number}.pdf`,
                    pdfBuffer: pdfResult.data.buffer,
                    contentType: 'application/pdf',
                    downloadedAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('💥 Download ticket error:', error);
            return {
                success: false,
                error: 'Download failed'
            };
        }
    }

    static async validatePublicAccess(ticketId, token) {
        try {
            // Quick validation without full ticket data
            const tokenResult = await DownloadTokenService.verifyDownloadToken(ticketId, token);
            
            return {
                success: tokenResult.success,
                valid: tokenResult.success && !tokenResult.expired,
                expired: tokenResult.expired || false,
                error: tokenResult.error || null
            };

        } catch (error) {
            return {
                success: false,
                valid: false,
                error: 'Validation failed'
            };
        }
    }
}

module.exports = PublicTicketService;