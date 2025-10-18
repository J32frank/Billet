const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    static transporter = null;

    static initializeTransporter() {
        if (this.transporter) return;

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.log('✅ Email transporter initialized');
    }

    static async loadEmailTemplate(templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateContent);
            return template(data);
        } catch (error) {
            console.error('❌ Failed to load email template:', error);
            // Fallback to simple text template
            return this.getFallbackTemplate(templateName, data);
        }
    }

    static getFallbackTemplate(templateName, data) {
        const templates = {
            ticket: `
                <h2>🎟️ Your Cinema Ticket</h2>
                <p>Hello ${data.buyerName},</p>
                <p>Here is your ticket for <strong>${data.eventName}</strong>:</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Ticket Details</h3>
                    <p><strong>Event:</strong> ${data.eventName}</p>
                    <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
                    <p><strong>Ticket #:</strong> ${data.ticketNumber}</p>
                    <p><strong>Buyer:</strong> ${data.buyerName}</p>
                    <p><strong>Price:</strong> $${data.ticketPrice}</p>
                    
                    <div style="margin: 20px 0;">
                        <a href="${data.downloadUrl}" 
                           style="background: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                           📥 Download Your Ticket
                        </a>
                    </div>
                </div>
                
                <p style="color: #666;">
                    <strong>Important:</strong> 
                    <br>• This link expires in <strong>10 minutes</strong>
                    <br>• Present your ticket at the venue
                    <br>• Keep this ticket secure
                </p>
                
                <p>Thank you for your purchase!</p>
                <p><em>The ${data.sellerName} Team</em></p>
            `
        };

        return templates[templateName] || '<p>Your ticket is ready for download.</p>';
    }

    static async sendTicketEmail(email, ticketData, downloadUrl) {
        try {
            this.initializeTransporter();

            console.log(`📧 Sending ticket email to: ${email}`);

            const emailData = {
                buyerName: ticketData.buyer_name,
                eventName: ticketData.events?.name || 'Event',
                eventDate: ticketData.events?.event_date,
                ticketNumber: ticketData.ticket_number,
                ticketPrice: parseFloat(ticketData.ticket_price).toFixed(2),
                downloadUrl: downloadUrl,
                sellerName: ticketData.sellers?.name || 'Ticket Seller',
                expiryTime: '10 minutes'
            };

            const htmlContent = await this.loadEmailTemplate('ticket', emailData);

            const mailOptions = {
                from: `"Billet Tickets" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Your Ticket for ${emailData.eventName}`,
                html: htmlContent,
                text: this.generatePlainText(emailData) // Fallback for text-only clients
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Email sent successfully:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
                recipient: email
            };

        } catch (error) {
            console.error('❌ Email sending failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static generatePlainText(data) {
        return `
CINEMA TICKET

Hello ${data.buyerName},

Your ticket for ${data.eventName} is ready!

Event: ${data.eventName}
Date: ${new Date(data.eventDate).toLocaleDateString()}
Ticket #: ${data.ticketNumber}
Buyer: ${data.buyerName}
Price: $${data.ticketPrice}

Download your ticket: ${data.downloadUrl}

Important:
• This link expires in 10 minutes
• Present your ticket at the venue
• Keep this ticket secure

Thank you for your purchase!
The ${data.sellerName} Team
        `.trim();
    }

    static async testEmail() {
        try {
            const testData = {
                buyer_name: 'Test Buyer',
                ticket_number: 'TKT-TEST-123',
                ticket_price: 25.50,
                events: {
                    name: 'Test Movie Premiere',
                    event_date: new Date().toISOString()
                },
                sellers: {
                    name: 'Test Seller'
                }
            };

            const testUrl = 'https://yourapp.com/ticket/test-token';
            const result = await this.sendTicketEmail('test@example.com', testData, testUrl);
            
            console.log('🧪 Email test result:', result);
            return result;

        } catch (error) {
            console.error('❌ Email test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;