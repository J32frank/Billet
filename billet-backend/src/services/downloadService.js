const supabase = require('../config/database');
const TicketImageService = require('./pdfService');
const TimerService = require('./timerService');

class DownloadService {
    static async generateTicketImage(ticketId, token) {
        try {
            console.log(`🖼️ Image download request - Ticket: ${ticketId}, Token: ${token}`);
            
            // Use TimerService for validation
            const tokenValidation = await TimerService.validateTokenForDownload(token);
            
            // Get the actual ticket ID from the token data directly from database
            const tokenTicketId = await this.getTicketIdFromToken(token);
            
            console.log(`🔍 DEBUG - Token ticket ID: ${tokenTicketId}, Request ticket ID: ${ticketId}`);
            
            // Additional check: verify token belongs to the correct ticket
            if (tokenTicketId !== ticketId) {
                console.log(`❌ Token mismatch: Token belongs to ${tokenTicketId}, but request is for ${ticketId}`);
                throw new Error('Token does not match ticket');
            }
            
            // Get complete ticket data
            const ticketData = await this.getTicketData(ticketId);
            
            // Generate ticket image
            const imageBytes = await TicketImageService.generateTicketPNG(
                ticketData,
                ticketData.events,
                ticketData.sellers
            );
            
            // Mark token as used after successful generation
            await this.markTokenAsUsed(tokenValidation.tokenId);
            
            console.log('✅ Ticket image generated and token marked as used');
            return imageBytes;
            
        } catch (error) {
            console.error('💥 Image download service error:', error);
            throw error;
        }
    }

    // ... keep all other methods the same
    static async getTicketIdFromToken(token) {
        try {
            const { data: tokenData, error } = await supabase
                .from('download_tokens')
                .select('ticket_id')
                .eq('token', token)
                .single();
            
            if (error) {
                console.error('❌ Error getting ticket ID from token:', error);
                throw error;
            }
            
            console.log('✅ Got ticket ID from token:', tokenData.ticket_id);
            return tokenData.ticket_id;
            
        } catch (error) {
            console.error('❌ Failed to get ticket ID from token:', error);
            throw new Error('Invalid token');
        }
    }

    static async markTokenAsUsed(tokenId) {
        try {
            const { error } = await supabase
                .from('download_tokens')
                .update({ 
                    is_used: true, 
                    used_at: new Date().toISOString() 
                })
                .eq('id', tokenId);
            
            if (error) throw error;
            console.log('✅ Token marked as used');
            
        } catch (error) {
            console.error('❌ Failed to mark token as used:', error);
            // Don't throw - we still want to send the PDF
        }
    }
    
    static async getTicketData(ticketId) {
        try {
            const { data: ticket, error } = await supabase
                .from('tickets')
                .select(`
                    *,
                    events (*),
                    sellers (*)
                `)
                .eq('id', ticketId)
                .single();
            
            if (error) throw error;
            return ticket;
            
        } catch (error) {
            console.error('❌ Failed to fetch ticket data:', error);
            throw new Error('Ticket not found');
        }
    }
}

module.exports = DownloadService;