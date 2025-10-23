// ...existing code...
const pureimage = require("pureimage");
const QRCode = require("qrcode");
const { Readable, PassThrough } = require("stream");
const FontService = require("./fontService");

// Initialize fonts at module load
FontService.init();

class TicketImageService {
  static async generateTicketImage(ticketFullData) {
    try {
      console.log("🖼️ Generating ticket image for download");

      const ticketData = ticketFullData.ticket;
      const eventData = ticketFullData.event;
      const sellerData = ticketFullData.seller;

      const imageBuffer = await this.generateTicketPNG(
        ticketData,
        eventData,
        sellerData
      );

      return {
        success: true,
        data: {
          buffer: imageBuffer,
          contentType: "image/png",
        },
      };
    } catch (error) {
      console.error("❌ Ticket image generation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async generateTicketPNG(ticketData, eventData, sellerData) {
    try {
      console.log(
        "🖼️ Generating ticket PNG for:",
        ticketData.ticket_number || ticketData.id
      );

      // Create canvas using pureimage
      const canvas = pureimage.make(400, 600);
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 600);

      // Generate QR code
      const qrValue =
        ticketData.cryptic_code || ticketData.ticket_number || ticketData.id;
      const qrCodeDataURL = await QRCode.toDataURL(qrValue, {
        width: 150,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });

      // Convert QR code data URL to buffer
      const qrBase64 = qrCodeDataURL.replace("data:image/png;base64,", "");
      const qrBuffer = Buffer.from(qrBase64, "base64");

      // Decode QR buffer to pureimage bitmap using a Readable stream
      const qrStream = Readable.from([qrBuffer]);
      const qrBitmap = await pureimage.decodePNGFromStream(qrStream);

      try {
        let y = 40;

        // Header
        ctx.fillStyle = "#000000";
        ctx.font = "24px Roboto-Bold";
        ctx.textAlign = "center";
        ctx.fillText("EVENT TICKET", 200, y);
        y += 50;

        // Event name
        ctx.font = "18px Roboto-Bold";
        const eventName = eventData.name || eventData.event_name || "Event";
        ctx.fillText(eventName, 200, y);
        y += 40;

        // Event details
        ctx.font = "14px Roboto";
        ctx.textAlign = "left";
        const eventDate = eventData.event_date
          ? new Date(eventData.event_date).toLocaleDateString()
          : "TBD";
        ctx.fillText(`Date: ${eventDate}`, 30, y);
        y += 25;

        ctx.fillText(`Location: ${eventData.location || "Venue TBD"}`, 30, y);
        y += 40;

        // Ticket info
        ctx.font = "16px Roboto-Bold";
        ctx.fillText("TICKET INFORMATION", 30, y);
        y += 30;

        ctx.font = "12px Roboto";
        const ticketNumber = ticketData.ticket_number || ticketData.id || "N/A";
        ctx.fillText(`Ticket #: ${ticketNumber}`, 30, y);
        y += 20;

        const buyerName =
          ticketData.buyer_name || ticketData.buyerName || "N/A";
        ctx.fillText(`Buyer: ${buyerName}`, 30, y);
        y += 20;

        if (ticketData.buyer_phone || ticketData.buyerPhone) {
          ctx.fillText(
            `Phone: ${ticketData.buyer_phone || ticketData.buyerPhone}`,
            30,
            y
          );
          y += 20;
        }

        const price = ticketData.ticket_price || eventData.ticket_price || "0";
        ctx.fillStyle = "#22c55e";
        ctx.font = "14px Roboto-Bold";
        ctx.fillText(`Price: ${price} NSL`, 30, y);
        y += 50;

        // QR Code section
        ctx.fillStyle = "#000000";
        ctx.font = "14px Roboto-Bold";
        ctx.textAlign = "center";
        ctx.fillText("SCAN AT EVENT ENTRANCE", 200, y);
        y += 30;

        // Draw QR code bitmap
        ctx.drawImage(qrBitmap, 125, y, 150, 150);
        y += 170;

        // Verification code
        if (ticketData.cryptic_code) {
          ctx.fillStyle = "#666666";
          ctx.font = "10px Roboto";
          ctx.textAlign = "center";
          ctx.fillText(`Verification: ${ticketData.cryptic_code}`, 200, y);
        }

        // Footer
        ctx.fillStyle = "#888888";
        ctx.font = "12px Roboto";
        ctx.fillText("Present this ticket at the event entrance", 200, 570);

        // Encode canvas to PNG buffer by writing to a PassThrough stream and collecting chunks
        const outStream = new PassThrough();
        const chunks = [];

        // Attach stream listeners BEFORE encoding
        outStream.on("data", (chunk) => {
          chunks.push(chunk);
          console.log(`📦 PNG chunk received: ${chunk.length} bytes`);
        });
        outStream.on("error", (error) => {
          console.error("❌ PNG stream error:", error);
        });

        console.log(`📊 qrBuffer length: ${qrBuffer.length}`);
        console.log("🔄 Starting PNG encoding...");

        // Start encoding and wait for it to finish
        const encodeResult = pureimage.encodePNGToStream(canvas, outStream);
        console.log(
          `🔄 encodeResult type: ${typeof encodeResult}, isPromise: ${encodeResult && typeof encodeResult.then === "function"}`
        );

        // If encodePNGToStream returns a promise, await it. Otherwise, wait for stream finish.
        if (encodeResult && typeof encodeResult.then === "function") {
          await encodeResult;
          console.log("✅ PNG encoding promise resolved");
        }

        // Wait for stream finish (only after encoding is done)
        await new Promise((resolve, reject) => {
          outStream.on("finish", () => {
            console.log("✅ PNG stream finished");
            resolve();
          });
          outStream.on("error", reject);
        });

        const buffer = Buffer.concat(chunks);
        console.log(
          `✅ PNG buffer created: ${buffer.length} bytes from ${chunks.length} chunks`
        );
        return buffer;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error("❌ PNG generation error:", error);
      throw new Error(`PNG generation failed: ${error.message}`);
    }
  }
}

module.exports = TicketImageService;
// ...existing code...
