const supabase = require('../config/database');
const { generateCrypticCode, generateTicketNumber } = require('../utils/ticketUtils');
const { generateQRCode } = require('./qrService');
const SellerService = require('./sellerService');
const DownloadTokenService = require('./downloadTokenService'); // ← ADD THIS

const generateTicket = async (ticketData) => {
    try {
        console.log('🔧 [generateTicket] Starting ticket generation');
        console.log('🔧 [generateTicket] Ticket data:', ticketData);

        const { sellerId, eventId, buyerName, buyerPhone, buyerEmail } = ticketData;

        // Step 1: Validate seller can generate tickets
        console.log('🔧 [generateTicket] Checking seller quota...');
        const quotaCheck = await SellerService.canSellTickets(sellerId);
        if (!quotaCheck.success) {
            throw new Error(quotaCheck.error);
        }

        // Step 2: Generate unique identifiers
        console.log('🔧 [generateTicket] Generating ticket identifiers...');
        const ticketNumber = generateTicketNumber();
        const crypticCode = generateCrypticCode();
        
        console.log('🔧 [generateTicket] Generated:', { ticketNumber, crypticCode });

        // Step 3: Create QR code data structure
        const qrData = {
            ticketId: ticketNumber,
            crypticCode: crypticCode,
            eventId: eventId,
            timestamp: new Date().toISOString()
        };

        // Step 4: Generate QR code image
        console.log('🔧 [generateTicket] Generating QR code...');
        const qrCodeData = await generateQRCode(qrData);

        // Step 5: Insert ticket into database (price auto-set by trigger)
        console.log('🔧 [generateTicket] Inserting into database...');
        const { data: ticket, error } = await supabase
            .from('tickets')
            .insert([
                {
                    ticket_number: ticketNumber,
                    cryptic_code: crypticCode,
                    buyer_name: buyerName,
                    buyer_phone: buyerPhone,
                    buyer_email: buyerEmail,
                    event_id: eventId,
                    seller_id: sellerId,
                    qr_code_data: qrCodeData,
                    status: 'valid',
                    generated_at: new Date().toISOString()
                }
            ])
            .select(`
                id,
                ticket_number,
                cryptic_code,
                buyer_name,
                buyer_phone,
                ticket_price,
                event_id,
                seller_id,
                status,
                generated_at
            `)
            .single();

        if (error) {
            console.log('❌ [generateTicket] Database error:', error);
            throw new Error(`Failed to create ticket: ${error.message}`);
        }

        // ✅ NEW: Generate download token for the ticket
        console.log('🔧 [generateTicket] Generating download token...');
        const downloadToken = await DownloadTokenService.generateDownloadToken(ticket.id);
        const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ticket/${ticket.id}/${downloadToken}`;

        // Step 6: Update seller's ticket count
        console.log('🔧 [generateTicket] Updating seller ticket count...');
        await supabase.rpc('increment_seller_tickets', { seller_id: sellerId });

        console.log('✅ [generateTicket] Ticket generated successfully:', ticketNumber);
        return {
            success: true,
            data: {
                ...ticket,
                qrCodeData: qrCodeData,
                downloadToken: downloadToken,  // ✅ ADD THIS
                downloadUrl: downloadUrl       // ✅ ADD THIS
            },
            message: 'Ticket generated successfully'
        };

    } catch (error) {
        console.log('💥 [generateTicket] Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get ticket by cryptic code (for verification)
const getTicketByCrypticCode = async (crypticCode) => {
    try {
        console.log('🔧 [getTicketByCrypticCode] Looking up ticket:', crypticCode);

        const { data: ticket, error } = await supabase
            .from('tickets')
            .select(`
                *,
                events (name, event_date, location),
                sellers (name, email)
            `)
            .eq('cryptic_code', crypticCode)
            .single();

        if (error) throw new Error('Ticket not found');

        return {
            success: true,
            data: ticket
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    generateTicket,
    getTicketByCrypticCode
};