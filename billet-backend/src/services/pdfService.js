const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');

class TicketImageService {
    static async generateTicketImage(ticketFullData) {
        try {
            console.log('🖼️ Generating ticket image for download');
            
            const ticketData = ticketFullData.ticket;
            const eventData = ticketFullData.event;
            const sellerData = ticketFullData.seller;
            
            const imageBuffer = await this.generateTicketPNG(ticketData, eventData, sellerData);
            
            return {
                success: true,
                data: {
                    buffer: imageBuffer,
                    contentType: 'image/png'
                }
            };
            
        } catch (error) {
            console.error('❌ Ticket image generation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    static async generateTicketPNG(ticketData, eventData, sellerData) {
        try {
            console.log('🖼️ Generating ticket PNG for:', ticketData.ticket_number || ticketData.id);
            
            // Create canvas
            const canvas = createCanvas(400, 600);
            const ctx = canvas.getContext('2d');
            
            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 400, 600);
            
            // Generate QR code
            const qrValue = ticketData.cryptic_code || ticketData.ticket_number || ticketData.id;
            const qrCodeDataURL = await QRCode.toDataURL(qrValue, {
                width: 150,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });
            
            // Convert QR code data URL to buffer and load as image
            const qrBase64 = qrCodeDataURL.replace('data:image/png;base64,', '');
            const qrBuffer = Buffer.from(qrBase64, 'base64');
            
            // Load image from buffer
            const { loadImage } = require('canvas');
            const qrImage = await loadImage(qrBuffer);
            
            try {
                        let y = 40;
                        
                        // Header
                        ctx.fillStyle = '#000000';
                        ctx.font = 'bold 24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('EVENT TICKET', 200, y);
                        y += 50;
                        
                        // Event name
                        ctx.font = 'bold 18px Arial';
                        const eventName = eventData.name || eventData.event_name || 'Event';
                        ctx.fillText(eventName, 200, y);
                        y += 40;
                        
                        // Event details
                        ctx.font = '14px Arial';
                        ctx.textAlign = 'left';
                        const eventDate = eventData.event_date ? new Date(eventData.event_date).toLocaleDateString() : 'TBD';
                        ctx.fillText(`Date: ${eventDate}`, 30, y);
                        y += 25;
                        
                        ctx.fillText(`Location: ${eventData.location || 'Venue TBD'}`, 30, y);
                        y += 40;
                        
                        // Ticket info
                        ctx.font = 'bold 16px Arial';
                        ctx.fillText('TICKET INFORMATION', 30, y);
                        y += 30;
                        
                        ctx.font = '12px Arial';
                        const ticketNumber = ticketData.ticket_number || ticketData.id || 'N/A';
                        ctx.fillText(`Ticket #: ${ticketNumber}`, 30, y);
                        y += 20;
                        
                        const buyerName = ticketData.buyer_name || ticketData.buyerName || 'N/A';
                        ctx.fillText(`Buyer: ${buyerName}`, 30, y);
                        y += 20;
                        
                        if (ticketData.buyer_phone || ticketData.buyerPhone) {
                            ctx.fillText(`Phone: ${ticketData.buyer_phone || ticketData.buyerPhone}`, 30, y);
                            y += 20;
                        }
                        
                        const price = ticketData.ticket_price || eventData.ticket_price || '0';
                        ctx.fillStyle = '#22c55e';
                        ctx.font = 'bold 14px Arial';
                        ctx.fillText(`Price: ${price} NSL`, 30, y);
                        y += 50;
                        
                        // QR Code section
                        ctx.fillStyle = '#000000';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('SCAN AT EVENT ENTRANCE', 200, y);
                        y += 30;
                        
                        // Draw QR code
                        ctx.drawImage(qrImage, 125, y, 150, 150);
                        y += 170;
                        
                        // Verification code
                        if (ticketData.cryptic_code) {
                            ctx.fillStyle = '#666666';
                            ctx.font = '10px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`Verification: ${ticketData.cryptic_code}`, 200, y);
                        }
                        
                        // Footer
                        ctx.fillStyle = '#888888';
                        ctx.font = '12px Arial';
                        ctx.fillText('Present this ticket at the event entrance', 200, 570);
                        
                const buffer = canvas.toBuffer('image/png');
                console.log('✅ Ticket PNG generated successfully');
                return buffer;
                
            } catch (error) {
                throw error;
            }
            
        } catch (error) {
            console.error('❌ PNG generation error:', error);
            throw new Error(`PNG generation failed: ${error.message}`);
        }
    }
}

module.exports = TicketImageService;