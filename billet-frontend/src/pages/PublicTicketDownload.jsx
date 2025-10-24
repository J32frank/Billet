import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Clock, CheckCircle, AlertTriangle, Ticket } from 'lucide-react';

// QR Code Component
const QRCodeComponent = ({ value, size = 200 }) => {
  const [qrDataURL, setQrDataURL] = React.useState('');
  
  React.useEffect(() => {
    if (value) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        
        const qrSize = 21;
        const cellSize = size / qrSize;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'black';
        
        for (let i = 0; i < qrSize; i++) {
          for (let j = 0; j < qrSize; j++) {
            const hash = (value.charCodeAt((i * qrSize + j) % value.length) + i + j) % 3;
            if (hash === 0) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
          }
        }
        
        const finderSize = 7 * cellSize;
        const positions = [[0, 0], [qrSize - 7, 0], [0, qrSize - 7]];
        
        positions.forEach(([x, y]) => {
          const startX = x * cellSize;
          const startY = y * cellSize;
          
          ctx.fillStyle = 'black';
          ctx.fillRect(startX, startY, finderSize, finderSize);
          ctx.fillStyle = 'white';
          ctx.fillRect(startX + cellSize, startY + cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize);
          ctx.fillStyle = 'black';
          ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        });
        
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
    <div className="w-full aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden p-4" style={{ backgroundColor: 'white' }}>
      {qrDataURL ? (
        <img src={qrDataURL} alt="QR Code" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">QR Code</span>
        </div>
      )}
    </div>
  );
};

const PublicTicketDownload = () => {
  const { ticketId, token } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (ticketId && token) {
      fetchTicketInfo();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [ticketId, token]);

  const fetchTicketInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/public/ticket/${ticketId}/${token}/info`);
      const result = await response.json();

      if (result.success) {
        setTicketData(result.data);
        setTimeRemaining(result.data.download.timeRemaining);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Ticket info error:', err);
      setError('Failed to load ticket information');
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    setTimeRemaining(prev => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      // Using the correct endpoint from the backend routes
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/public/download/${ticketId}/${token}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketData.ticket.number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'rgb(248, 248, 255)' }}>Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgb(239, 68, 68)' }}>
            <AlertTriangle size={32} style={{ color: 'white' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'white' }}>Access Denied</h2>
          <p className="mb-4" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>{error}</p>
        </div>
      </div>
    );
  }

  const isExpired = timeRemaining <= 0;
  const isExpiringSoon = timeRemaining <= 300; // 5 minutes

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgb(59, 130, 246)' }}>
            <Ticket size={32} style={{ color: 'white' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>Your Ticket</h1>
          <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Download your ticket for the event</p>
        </div>

        {/* Timer */}
        <div className={`rounded-xl p-4 mb-6 text-center ${isExpired ? 'border border-red-500' : isExpiringSoon ? 'border border-yellow-500' : ''}`} 
             style={{ backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.1)' : isExpiringSoon ? 'rgba(251, 191, 36, 0.1)' : 'rgb(33, 42, 55)' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} style={{ color: isExpired ? 'rgb(239, 68, 68)' : isExpiringSoon ? 'rgb(251, 191, 36)' : 'rgb(59, 130, 246)' }} />
            <span className="text-sm font-medium" style={{ color: isExpired ? 'rgb(239, 68, 68)' : isExpiringSoon ? 'rgb(251, 191, 36)' : 'rgb(248, 248, 255)' }}>
              {isExpired ? 'Download Expired' : 'Time Remaining'}
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: isExpired ? 'rgb(239, 68, 68)' : isExpiringSoon ? 'rgb(251, 191, 36)' : 'white' }}>
            {isExpired ? '00:00' : formatTime(timeRemaining)}
          </p>
        </div>

        {/* QR Code Display */}
        <div className="rounded-xl p-4 mb-6 text-center" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>Scan at Event</h3>
          <div className="max-w-48 mx-auto mb-3">
            <QRCodeComponent value={ticketData.ticket.cryptic_code || ticketData.ticket.number} size={180} />
          </div>
          <p className="text-xs" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Show this QR code at the event entrance</p>
        </div>

        {/* Ticket Info */}
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgb(33, 42, 55)' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: 'white' }}>{ticketData.event.name}</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Ticket #:</span>
              <span style={{ color: 'white' }}>{ticketData.ticket.number}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Buyer:</span>
              <span style={{ color: 'white' }}>{ticketData.ticket.buyer}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Date:</span>
              <span style={{ color: 'white' }}>{new Date(ticketData.event.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Location:</span>
              <span style={{ color: 'white' }}>{ticketData.event.location}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>Price:</span>
              <span style={{ color: 'rgb(34, 197, 94)' }}>{ticketData.ticket.price} NSL</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isExpired || downloading}
          className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            backgroundColor: isExpired ? 'rgb(107, 114, 128)' : 'rgb(34, 197, 94)',
            color: 'white'
          }}
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Downloading...
            </>
          ) : isExpired ? (
            <>
              <AlertTriangle size={20} />
              Download Expired
            </>
          ) : (
            <>
              <Download size={20} />
              Download Ticket Image
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <p className="font-semibold mb-2" style={{ color: 'rgb(59, 130, 246)' }}>📱 Important</p>
          <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
            Save this ticket image to your device. You'll need to show it at the event entrance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTicketDownload;