const supabase = require('../config/database');

class QRVerificationService {
    static async verifyTicket(crypticCode, adminId, scanLocation = null) {
        try {
            console.log(`🔍 Verifying ticket with cryptic code: ${crypticCode}`);

            // Get ticket by cryptic code
            const { data: ticket, error: ticketError } = await supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    cryptic_code,
                    buyer_name,
                    buyer_phone,
                    status,
                    generated_at,
                    events (
                        id,
                        name,
                        event_date,
                        location
                    ),
                    sellers (
                        id,
                        name,
                        is_active
                    )
                `)
                .eq('cryptic_code', crypticCode)
                .single();

            if (ticketError || !ticket) {
                await this.logScan(null, adminId, 'invalid', 'Ticket not found', scanLocation);
                return {
                    success: false,
                    status: 'invalid',
                    message: 'Invalid ticket code',
                    data: null
                };
            }

            // Check if seller is active
            if (!ticket.sellers.is_active) {
                await this.logScan(ticket.id, adminId, 'seller_revoked', 'Seller account deactivated', scanLocation);
                return {
                    success: false,
                    status: 'seller_revoked',
                    message: 'Ticket invalid - seller account deactivated',
                    data: {
                        ticketNumber: ticket.ticket_number,
                        buyerName: ticket.buyer_name,
                        event: ticket.events.name
                    }
                };
            }

            // Check ticket status
            let scanResult;
            let message;
            let shouldUpdateStatus = false;

            switch (ticket.status) {
                case 'valid':
                    scanResult = 'valid_first_scan';
                    message = 'Ticket verified successfully - Entry granted';
                    shouldUpdateStatus = true;
                    break;
                    
                case 'used':
                    scanResult = 'already_used';
                    message = 'Ticket already used - Duplicate scan detected';
                    break;
                    
                case 'revoked':
                    scanResult = 'revoked';
                    message = 'Ticket temporarily revoked - Contact administrator';
                    break;
                    
                default:
                    scanResult = 'invalid_status';
                    message = 'Ticket has invalid status';
            }

            // Update ticket status to 'used' if first valid scan
            if (shouldUpdateStatus) {
                const { error: updateError } = await supabase
                    .from('tickets')
                    .update({ 
                        status: 'used',
                        used_at: new Date().toISOString()
                    })
                    .eq('id', ticket.id);

                if (updateError) {
                    console.error('Failed to update ticket status:', updateError);
                }
            }

            // Log the scan
            await this.logScan(ticket.id, adminId, scanResult, message, scanLocation);

            console.log(`✅ Ticket verification complete: ${scanResult}`);

            return {
                success: scanResult === 'valid_first_scan',
                status: scanResult,
                message: message,
                data: {
                    ticketId: ticket.id,
                    ticketNumber: ticket.ticket_number,
                    buyerName: ticket.buyer_name,
                    buyerPhone: ticket.buyer_phone,
                    event: {
                        name: ticket.events.name,
                        date: ticket.events.event_date,
                        location: ticket.events.location
                    },
                    seller: {
                        name: ticket.sellers.name
                    },
                    generatedAt: ticket.generated_at,
                    currentStatus: shouldUpdateStatus ? 'used' : ticket.status
                }
            };

        } catch (error) {
            console.error('💥 QR verification error:', error);
            await this.logScan(null, adminId, 'system_error', error.message, scanLocation);
            
            return {
                success: false,
                status: 'system_error',
                message: 'System error during verification',
                data: null
            };
        }
    }

    static async logScan(ticketId, adminId, scanResult, message, scanLocation = null) {
        try {
            const { error } = await supabase
                .from('scan_logs')
                .insert([
                    {
                        ticket_id: ticketId,
                        scanned_by: adminId,
                        scan_result: scanResult,
                        scan_message: message,
                        scan_location: scanLocation,
                        scanned_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.error('Failed to log scan:', error);
            }

        } catch (error) {
            console.error('Scan logging error:', error);
        }
    }

    static async getScanHistory(filters = {}) {
        try {
            let query = supabase
                .from('scan_logs')
                .select(`
                    id,
                    scan_result,
                    scan_message,
                    scan_location,
                    scanned_at,
                    tickets (
                        ticket_number,
                        buyer_name,
                        events (name)
                    ),
                    admins (
                        name,
                        email
                    )
                `)
                .order('scanned_at', { ascending: false });

            if (filters.ticketId) {
                query = query.eq('ticket_id', filters.ticketId);
            }

            if (filters.adminId) {
                query = query.eq('scanned_by', filters.adminId);
            }

            if (filters.result) {
                query = query.eq('scan_result', filters.result);
            }

            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data: logs, error } = await query;

            if (error) throw error;

            return {
                success: true,
                data: logs || []
            };

        } catch (error) {
            console.error('Failed to get scan history:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async getTicketScanHistory(ticketId) {
        try {
            const { data: scans, error } = await supabase
                .from('scan_logs')
                .select(`
                    scan_result,
                    scan_message,
                    scan_location,
                    scanned_at,
                    admins (name)
                `)
                .eq('ticket_id', ticketId)
                .order('scanned_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: scans || []
            };

        } catch (error) {
            console.error('Failed to get ticket scan history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = QRVerificationService;