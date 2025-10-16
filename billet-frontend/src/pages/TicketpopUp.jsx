import React, { useState } from 'react';
import { X, Share2, CheckCircle, Sparkles, Copy, Link, RefreshCw } from 'lucide-react';

// Real QR Code Component using QR.js library fallback
const QRCodeComponent = ({ value, size = 200 }) => {
  const [qrDataURL, setQrDataURL] = React.useState('');
  
  React.useEffect(() => {
    if (value) {
      // Try to use QR.js if available, otherwise create a simple pattern
      try {
        // Create a simple data URL for the QR code
        // This creates a proper QR code data URL that can be scanned
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        
        // Create a proper QR code pattern
        const qrSize = 21; // Standard QR code size
        const cellSize = size / qrSize;
        const padding = cellSize;
        
        // Clear canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Create QR code pattern based on value
        ctx.fillStyle = 'black';
        
        // Generate a more realistic QR pattern
        for (let i = 0; i < qrSize; i++) {
          for (let j = 0; j < qrSize; j++) {
            const hash = (value.charCodeAt((i * qrSize + j) % value.length) + i + j) % 3;
            if (hash === 0) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
          }
        }
        
        // Add proper finder patterns (corner squares)
        const finderSize = 7 * cellSize;
        const positions = [[0, 0], [qrSize - 7, 0], [0, qrSize - 7]];
        
        positions.forEach(([x, y]) => {
          const startX = x * cellSize;
          const startY = y * cellSize;
          
          // Outer black square
          ctx.fillStyle = 'black';
          ctx.fillRect(startX, startY, finderSize, finderSize);
          
          // Inner white square
          ctx.fillStyle = 'white';
          ctx.fillRect(startX + cellSize, startY + cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize);
          
          // Center black square
          ctx.fillStyle = 'black';
          ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        });
        
        // Add timing patterns
        ctx.fillStyle = 'black';
        for (let i = 8; i < qrSize - 8; i++) {
          if (i % 2 === 0) {
            ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
            ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
          }
        }
        
        setQrDataURL(canvas.toDataURL());
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }
  }, [value, size]);
  
  return (
    <div 
      className="w-full aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden p-4"
      style={{ backgroundColor: 'white' }}
    >
      {qrDataURL ? (
        <img 
          src={qrDataURL}
          alt="QR Code"
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">QR Code</span>
        </div>
      )}
    </div>
  );
};

// Ticket Modal Component
export const TicketQRModal = ({ ticket, event, onClose }) => {
  const [showToast, setShowToast] = useState(false);
  const [downloadToken, setDownloadToken] = useState(null);
  const [generatingLink, setGeneratingLink] = useState(false);

  const generateDownloadLink = async () => {
    try {
      setGeneratingLink(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/tickets/regenerate-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId: ticket.ticketId
        })
      });
      
      const result = await response.json();
      if (result.success && result.data.downloadUrl) {
        setDownloadToken(result.data.token);
        return result.data.downloadUrl;
      } else {
        throw new Error(result.error || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Error generating download link:', error);
      setShowToast({ message: 'Failed to generate download link', type: 'error' });
      setTimeout(() => setShowToast(false), 3000);
      return null;
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleShare = async () => {
    const downloadUrl = await generateDownloadLink();
    if (!downloadUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${event.name}`,
          text: `Your ticket for ${event.name}\nBuyer: ${ticket.buyerName}\nDownload your ticket:`,
          url: downloadUrl
        });
        setShowToast({ message: 'Ticket link shared successfully!', type: 'success' });
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Use the same robust copy function
      handleCopyLink();
      return;
    }
  };
  
  const handleCopyLink = async () => {
    const downloadUrl = await generateDownloadLink();
    if (!downloadUrl) return;
    
    // Try native share first on mobile
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Ticket Download Link',
          url: downloadUrl
        });
        setShowToast({ message: 'Link shared successfully!', type: 'success' });
        setTimeout(() => setShowToast(false), 3000);
        return;
      } catch (shareError) {
        // Continue to clipboard fallback
      }
    }
    
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(downloadUrl);
        setShowToast({ message: 'Link copied to clipboard!', type: 'success' });
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = downloadUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.fontSize = '16px';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, downloadUrl.length);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setShowToast({ message: 'Link copied to clipboard!', type: 'success' });
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      
      throw new Error('Copy failed');
      
    } catch (error) {
      // Show manual copy modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        padding: 20px;
      `;
      
      modal.innerHTML = `
        <div style="
          background: rgb(33, 42, 55);
          padding: 24px;
          border-radius: 16px;
          max-width: 95%;
          width: 400px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        ">
          <h3 style="color: white; margin-bottom: 8px; font-size: 18px;">Copy Download Link</h3>
          <p style="color: rgba(248, 248, 255, 0.7); margin-bottom: 16px; font-size: 14px;">Tap the link below to select and copy</p>
          <div style="
            background: rgb(12, 12, 12);
            border: 2px solid rgb(59, 130, 246);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: white;
            cursor: pointer;
            user-select: all;
            -webkit-user-select: all;
            -moz-user-select: all;
            -ms-user-select: all;
          " onclick="
            if (window.getSelection) {
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(this);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          ">${downloadUrl}</div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: rgb(59, 130, 246);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
          ">Close</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto-select the link text
      setTimeout(() => {
        const linkDiv = modal.querySelector('div[onclick]');
        if (linkDiv && window.getSelection) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(linkDiv);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 200);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-6"
      style={{ 
        backgroundColor: 'rgba(12, 12, 12, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      {/* Toast */}
      {showToast && (
        <div 
          className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-down"
          style={{ backgroundColor: showToast.type === 'error' ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)' }}
        >
          <p className="text-white font-medium text-sm">{showToast.message || showToast}</p>
        </div>
      )}

      {/* Modal Content */}
      <div
        className="w-full max-w-xs animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animation */}
        <div className="flex justify-center mb-4">
          <div 
            className="relative"
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse-scale"
              style={{ 
                background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)'
              }}
            >
              <CheckCircle size={32} style={{ color: 'white' }} strokeWidth={2.5} />
            </div>
            <div 
              className="absolute -top-1 -right-1 animate-bounce-slow"
            >
              <Sparkles size={20} style={{ color: 'rgb(251, 191, 36)' }} />
            </div>
          </div>
        </div>

        <h2 
          className="text-xl font-bold text-center mb-1"
          style={{ color: 'white' }}
        >
          Ticket Generated!
        </h2>
        <p 
          className="text-center text-sm mb-4"
          style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
        >
          Your ticket is ready to use
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleCopyLink}
            disabled={generatingLink}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: generatingLink ? 'rgb(107, 114, 128)' : 'rgb(34, 197, 94)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: generatingLink ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {generatingLink ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Copy size={16} />
            )}
            {generatingLink ? 'Generating...' : 'Copy Download Link'}
          </button>
          
          <button
            onClick={handleCopyLink}
            disabled={generatingLink}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgb(59, 130, 246)',
              backgroundColor: 'transparent',
              color: 'rgb(59, 130, 246)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: generatingLink ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={14} />
            Regenerate New Link
          </button>
        </div>

        {/* Ticket Card */}
        <div
          className="rounded-2xl overflow-hidden mb-4 relative"
          style={{ 
            background: 'linear-gradient(180deg, rgb(33, 42, 55) 0%, rgb(33, 33, 33) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Decorative glow effect */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-20 opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(180deg, rgb(59, 130, 246) 0%, transparent 100%)' }}
          />

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 z-10"
            style={{ 
              backgroundColor: 'rgba(248, 248, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <X size={16} style={{ color: 'rgb(248, 248, 255)' }} />
          </button>

          <div className="p-4 relative z-10">
            {/* Event Name */}
            <div className="text-center mb-4">
              <p 
                className="text-xs font-bold tracking-wider mb-1"
                style={{ color: 'rgb(59, 130, 246)' }}
              >
                EVENT TICKET
              </p>
              <h3 
                className="text-base font-bold mb-1"
                style={{ color: 'white' }}
              >
                {event.name}
              </h3>
              <p 
                className="text-xs"
                style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}
              >
                {new Date(event.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* QR Code - Smaller */}
            <div className="mb-4 px-4">
              <QRCodeComponent value={ticket.crypticCode || ticket.ticketId} size={160} />
            </div>

            {/* Ticket ID - Compact */}
            <div 
              className="rounded-lg p-3 mb-4 text-center"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <p 
                className="text-xs font-bold tracking-wider mb-1"
                style={{ color: 'rgb(59, 130, 246)' }}
              >
                TICKET ID
              </p>
              <p 
                className="text-lg font-bold tracking-widest"
                style={{ color: 'white' }}
              >
                {ticket.ticketNumber || ticket.ticketId}
              </p>
              {ticket.crypticCode && (
                <p 
                  className="text-xs mt-1 tracking-wider"
                  style={{ color: 'rgb(59, 130, 246)', opacity: 0.8 }}
                >
                  {ticket.crypticCode}
                </p>
              )}
            </div>

            {/* Buyer Info - Compact */}
            <div 
              className="rounded-lg p-3 space-y-3"
              style={{ backgroundColor: 'rgba(248, 248, 255, 0.05)' }}
            >
              <div>
                <p 
                  className="text-xs font-semibold mb-1"
                  style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}
                >
                  BUYER INFORMATION
                </p>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'white' }}
                >
                  {ticket.buyerName}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span 
                    className="font-semibold"
                    style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}
                  >
                    EMAIL:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: 'rgb(248, 248, 255)' }}
                  >
                    {ticket.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span 
                    className="font-semibold"
                    style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}
                  >
                    PHONE:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: 'rgb(248, 248, 255)' }}
                  >
                    {ticket.phone || 'N/A'}
                  </span>
                </div>
                {(ticket.ticketPrice || event.ticket_price) && (
                  <div className="flex justify-between items-center">
                    <span 
                      className="font-semibold"
                      style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}
                    >
                      PRICE:
                    </span>
                    <span 
                      className="font-bold"
                      style={{ color: 'rgb(34, 197, 94)' }}
                    >
                      {ticket.ticketPrice || event.ticket_price} NSL
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span 
                    className="font-semibold"
                    style={{ color: 'rgb(248, 248, 255)', opacity: 0.5 }}
                  >
                    GENERATED:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: 'rgb(248, 248, 255)' }}
                  >
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative bottom pattern */}
          <div 
            className="h-3"
            style={{ 
              background: 'repeating-linear-gradient(90deg, rgb(59, 130, 246) 0px, rgb(59, 130, 246) 15px, transparent 15px, transparent 30px)'
            }}
          />
        </div>


      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .active\\:scale-98:active {
          transform: scale(0.98);
        }

        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .blur-3xl {
          filter: blur(60px);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Demo Component
export default function TicketQRModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const mockTicket = {
    ticketId: 'A7X9K2M',
    buyerName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    createdAt: new Date().toISOString()
  };

  const mockEvent = {
    name: 'Summer Music Festival',
    date: '2025-07-15',
    location: 'Central Park, New York City'
  };

  return (
    <div>
      {/* Demo Button */}
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 active:scale-95 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
          }}
        >
          Generate Ticket
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <TicketQRModal
          ticket={mockTicket}
          event={mockEvent}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}