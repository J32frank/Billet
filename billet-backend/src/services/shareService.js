const supabase = require('../config/database');
const EmailService = require('./emailService');

class ShareService {
    static async sendTicketLink(ticketId, sellerId, contactMethod, contactInfo, customMessage = '') {
        try {
            console.log(`📤 Sending ticket via ${contactMethod} to: ${contactInfo}`);
            
            // Verify ticket belongs to seller
            const ticket = await this.verifyTicketOwnership(ticketId, sellerId);
            
            // Get or create download token
            const DownloadTokenService = require('./downloadTokenService');
            const token = await DownloadTokenService.generateDownloadToken(ticketId);
            const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ticket/${ticketId}/${token}`;
            
            // Get complete ticket data
            const ticketData = await this.getTicketDetails(ticketId);
            
            let result;
            
            switch (contactMethod.toLowerCase()) {
                case 'email':
                    result = await this.sendViaEmail(contactInfo, ticketData, downloadUrl, customMessage);
                    break;
                    
                case 'whatsapp':
                    result = await this.sendViaWhatsApp(contactInfo, ticketData, downloadUrl, customMessage);
                    break;
                    
                case 'sms':
                    result = await this.sendViaSMS(contactInfo, ticketData, downloadUrl, customMessage);
                    break;
                    
                default:
                    throw new Error(`Unsupported share method: ${contactMethod}`);
            }
            
            // Log the share activity
            await this.logShareActivity(ticketId, sellerId, contactMethod, contactInfo, result.success);
            
            console.log(`✅ Ticket shared via ${contactMethod} to: ${contactInfo}`);
            
            return {
                success: true,
                method: contactMethod,
                sentTo: contactInfo,
                downloadUrl: downloadUrl,
                message: `Ticket sent via ${contactMethod}`,
                details: result
            };
            
        } catch (error) {
            console.error('💥 Share service error:', error);
            throw error;
        }
    }
    
    static async sendViaEmail(email, ticketData, downloadUrl, customMessage = '') {
        try {
            console.log(`📧 Sending email to: ${email}`);
            
            // Development mode bypass
            if (process.env.NODE_ENV === 'development' && process.env.EMAIL_PASS === 'your-16-digit-app-password') {
                console.log('🚧 DEV MODE: Bypassing actual email send');
                console.log('📧 Email would be sent with:');
                console.log('   To:', email);
                console.log('   Download URL:', downloadUrl);
                console.log('   Ticket:', ticketData.ticket_number);
                
                return {
                    method: 'email',
                    recipient: email,
                    messageId: 'dev-mode-bypass-' + Date.now(),
                    status: 'simulated',
                    note: 'Email bypassed in development mode - configure EMAIL_PASS for real sending'
                };
            }
            
            const result = await EmailService.sendTicketEmail(email, ticketData, downloadUrl);
            
            if (!result.success) {
                throw new Error(`Email failed: ${result.error}`);
            }
            
            return {
                method: 'email',
                recipient: email,
                messageId: result.messageId,
                status: 'sent'
            };
            
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    
    static async sendViaWhatsApp(phoneNumber, ticketData, downloadUrl, customMessage = '') {
        try {
            console.log(`📱 Preparing WhatsApp message for: ${phoneNumber}`);
            
            const message = this.generateWhatsAppMessage(ticketData, downloadUrl, customMessage);
            const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
            
            // For backend, we return the message and URL - frontend would actually open WhatsApp
            return {
                method: 'whatsapp',
                recipient: phoneNumber,
                message: message,
                shareUrl: whatsappUrl,
                status: 'ready',
                instructions: 'Open WhatsApp with this pre-filled message'
            };
            
        } catch (error) {
            console.error('❌ WhatsApp preparation failed:', error);
            throw new Error(`Failed to prepare WhatsApp message: ${error.message}`);
        }
    }
    
    static async sendViaSMS(phoneNumber, ticketData, downloadUrl, customMessage = '') {
        try {
            console.log(`💬 Preparing SMS for: ${phoneNumber}`);
            
            const message = this.generateSMSMessage(ticketData, downloadUrl, customMessage);
            
            // In a real implementation, you'd integrate with Twilio or similar SMS service
            return {
                method: 'sms',
                recipient: phoneNumber,
                message: message,
                status: 'ready', 
                instructions: 'SMS ready to be sent via SMS gateway',
                characterCount: message.length
            };
            
        } catch (error) {
            console.error('❌ SMS preparation failed:', error);
            throw new Error(`Failed to prepare SMS: ${error.message}`);
        }
    }
    
    static generateWhatsAppMessage(ticketData, downloadUrl, customMessage = '') {
        const event = ticketData.events;
        const seller = ticketData.sellers;
        
        let message = `🎟️ *CINEMA TICKET*\n\n`;
        
        if (customMessage) {
            message += `${customMessage}\n\n`;
        }
        
        message += `*${event.name}*\n`;
        message += `📅 ${new Date(event.event_date).toLocaleDateString()}\n`;
        message += `🎭 ${event.location || 'Main Hall'}\n\n`;
        
        message += `*Ticket Details:*\n`;
        message += `🎫 #${ticketData.ticket_number}\n`;
        message += `👤 ${ticketData.buyer_name}\n`;
        message += `💰 $${parseFloat(ticketData.ticket_price).toFixed(2)}\n`;
        message += `🤵 ${seller.name}\n\n`;
        
        message += `📥 *Download Your Ticket:*\n`;
        message += `${downloadUrl}\n\n`;
        
        message += `⏰ *Important:*\n`;
        message += `• Link expires in *10 minutes*\n`;
        message += `• Present ticket at venue\n`;
        message += `• Keep this secure\n\n`;
        
        message += `Thank you! 🎬`;
        
        return message;
    }
    
    static generateSMSMessage(ticketData, downloadUrl, customMessage = '') {
        const event = ticketData.events;
        
        let message = `CINEMA TICKET\n\n`;
        
        if (customMessage) {
            message += `${customMessage}\n\n`;
        }
        
        message += `${event.name}\n`;
        message += `Date: ${new Date(event.event_date).toLocaleDateString()}\n`;
        message += `Ticket: ${ticketData.ticket_number}\n`;
        message += `Buyer: ${ticketData.buyer_name}\n`;
        message += `Price: $${ticketData.ticket_price}\n\n`;
        
        message += `Download: ${downloadUrl}\n\n`;
        
        message += `Expires in 10 min. Present at venue.`;
        
        return message;
    }
    
    static async verifyTicketOwnership(ticketId, sellerId) {
        try {
            const { data: ticket, error } = await supabase
                .from('tickets')
                .select('id, seller_id')
                .eq('id', ticketId)
                .eq('seller_id', sellerId)
                .single();
            
            if (error || !ticket) {
                throw new Error('Ticket not found or access denied');
            }
            
            return ticket;
            
        } catch (error) {
            console.error('❌ Ticket ownership verification failed:', error);
            throw new Error('You do not have permission to share this ticket');
        }
    }
    
    static async getTicketDetails(ticketId) {
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
            console.error('❌ Failed to fetch ticket details:', error);
            throw new Error('Could not retrieve ticket information');
        }
    }
    
    static async logShareActivity(ticketId, sellerId, method, contactInfo, success) {
        try {
            const { error } = await supabase
                .from('share_logs')
                .insert([
                    {
                        ticket_id: ticketId,
                        seller_id: sellerId,
                        share_method: method,
                        contact_info: contactInfo,
                        success: success,
                        shared_at: new Date().toISOString()
                    }
                ]);
            
            if (error) console.error('Failed to log share activity:', error);
            
        } catch (error) {
            console.error('Share logging error:', error);
        }
    }
    
    static async testShareService() {
        try {
            console.log('🧪 Testing share service...');
            
            // You'll need actual ticket and seller IDs for this test
            const testTicketId = 'your-test-ticket-id';
            const testSellerId = 'your-test-seller-id';
            
            const results = [];
            
            // Test email
            const emailResult = await this.sendTicketLink(
                testTicketId, 
                testSellerId, 
                'email', 
                'test@example.com',
                'Test message from seller'
            );
            results.push(emailResult);
            
            // Test WhatsApp
            const whatsappResult = await this.sendTicketLink(
                testTicketId,
                testSellerId,
                'whatsapp',
                '+1234567890', 
                'Test WhatsApp message'
            );
            results.push(whatsappResult);
            
            console.log('✅ Share service test completed');
            return { success: true, results };
            
        } catch (error) {
            console.error('❌ Share service test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = ShareService;