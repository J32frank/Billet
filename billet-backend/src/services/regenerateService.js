const supabase = require('../config/database');
const DownloadTokenService = require('./downloadTokenService');
const { sendTicketLink } = require('./shareService');

class RegenerateService {
    static async regenerateDownloadLink(ticketId, sellerId) {
        try {
            console.log(`🔄 Regenerating download link for ticket: ${ticketId}`);
            
            // Step 1: Verify ticket belongs to seller
            const ticket = await this.verifyTicketOwnership(ticketId, sellerId);
            
            // Step 2: Create new download token
            const newToken = await DownloadTokenService.generateDownloadToken(ticketId);
            
            // Step 3: Get ticket details for the link
            const ticketDetails = await this.getTicketDetails(ticketId);
            
            console.log('✅ New download token generated:', newToken);
            
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            
            return {
                success: true,
                token: newToken,
                ticket: ticketDetails,
                downloadUrl: `${frontendUrl}/ticket/${ticketId}/${newToken}`
            };
            
        } catch (error) {
            console.error('💥 Regenerate service error:', error);
            throw error;
        }
    }
    
    static async verifyTicketOwnership(ticketId, sellerId) {
        try {
            const { data: ticket, error } = await supabase
                .from('tickets')
                .select('id, seller_id, ticket_number, buyer_name')
                .eq('id', ticketId)
                .eq('seller_id', sellerId)
                .single();
            
            if (error || !ticket) {
                throw new Error('Ticket not found or access denied');
            }
            
            return ticket;
            
        } catch (error) {
            console.error('❌ Ticket ownership verification failed:', error);
            throw new Error('You do not have permission to regenerate this ticket link');
        }
    }
    
    static async getTicketDetails(ticketId) {
        try {
            const { data: ticket, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    buyer_name,
                    buyer_phone,
                    buyer_email,
                    generated_at,
                    events (name, event_date, location)
                `)
                .eq('id', ticketId)
                .single();
            
            if (error) throw error;
            return ticket;
            
        } catch (error) {
            console.error('❌ Failed to fetch ticket details:', error);
            throw new Error('Could not retrieve ticket information');
        }
    }
    
    static async sendRegeneratedLink(ticketId, sellerId, contactMethod, contactInfo) {
        try {
            console.log(`📤 Sending regenerated link via ${contactMethod} to: ${contactInfo}`);
            
            // Regenerate the link
            const regenerationResult = await this.regenerateDownloadLink(ticketId, sellerId);
            
            // Send via specified method
            const sendResult = await sendTicketLink(
                regenerationResult.downloadUrl,
                regenerationResult.ticket,
                contactMethod,
                contactInfo
            );
            
            return {
                success: true,
                message: `New ticket link sent via ${contactMethod}`,
                downloadUrl: regenerationResult.downloadUrl,
                sentTo: contactInfo
            };
            
        } catch (error) {
            console.error('💥 Send regenerated link error:', error);
            throw error;
        }
    }
}

module.exports = RegenerateService;