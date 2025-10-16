import React, { useState, useRef, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera, CameraOff } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      
      // Check for camera permissions first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }
      
      const result = await codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const scannedText = result.getText();
          console.log('QR Code scanned:', scannedText);
          
          // Extract cryptic code (16 characters)
          let crypticCode = scannedText;
          if (scannedText.length > 16) {
            // Try to parse as JSON first
            try {
              const parsed = JSON.parse(scannedText);
              crypticCode = parsed.crypticCode || parsed.ticketId || scannedText.substring(0, 16);
            } catch {
              crypticCode = scannedText.substring(0, 16);
            }
          }
          
          handleScan(crypticCode, 'Camera Scan');
          stopCamera();
        }
        if (err && !(err.name === 'NotFoundException')) {
          console.error('Scan error:', err);
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access denied or not available';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      }
      setCameraError(errorMessage);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setCameraActive(false);
  };

  const handleScan = async (code, scanType) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BILLET_BACKEND_URL}/api/qr/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crypticCode: code,
          scanLocation: scanType
        })
      });

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Scan failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => {
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim(), 'Manual Entry');
  };

  const getResultIcon = () => {
    if (!scanResult) return null;
    if (scanResult.success) return <CheckCircle size={48} className="text-green-500" />;
    if (scanResult.status === 'invalid') return <XCircle size={48} className="text-red-500" />;
    return <AlertCircle size={48} className="text-yellow-500" />;
  };

  const getResultColor = () => {
    if (!scanResult) return 'rgb(33, 42, 55)';
    if (scanResult.success) return 'rgb(34, 197, 94)';
    if (scanResult.status === 'invalid') return 'rgb(239, 68, 68)';
    return 'rgb(245, 158, 11)';
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'rgb(59, 130, 246)' }}
          >
            <QrCode size={32} style={{ color: 'white' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'white' }}>
            QR Scanner
          </h1>
          <p style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
            Scan or enter ticket codes manually
          </p>
        </div>

        {/* Camera Scanner */}
        <div 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
            Camera Scanner
          </h3>
          
          {!cameraActive ? (
            <div className="text-center">
              <button
                onClick={startCamera}
                className="w-full py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgb(34, 197, 94)', color: 'white' }}
              >
                <Camera size={20} />
                Start Camera Scan
              </button>
              {cameraError && (
                <p className="mt-2 text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                  {cameraError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                />
                <div className="absolute inset-0 border-2 border-dashed" style={{ borderColor: 'rgb(34, 197, 94)' }}>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2" style={{ borderColor: 'rgb(34, 197, 94)' }}></div>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgb(239, 68, 68)', color: 'white' }}
              >
                <CameraOff size={20} />
                Stop Camera
              </button>
              <p className="text-center text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
                Point camera at QR code to scan automatically
              </p>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
            Manual Code Entry
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter 16-character code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 text-center font-mono"
              style={{
                backgroundColor: 'rgb(33, 33, 33)',
                borderColor: 'rgb(33, 42, 55)',
                color: 'rgb(248, 248, 255)',
              }}
              maxLength={16}
            />
            <button
              onClick={handleManualScan}
              disabled={loading || !manualCode.trim()}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
            >
              {loading ? 'Scanning...' : 'Verify Code'}
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div 
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: getResultColor() + '20', border: `2px solid ${getResultColor()}` }}
          >
            <div className="mb-4">
              {getResultIcon()}
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: getResultColor() }}>
              {scanResult.success ? 'Valid Ticket' : 'Invalid Ticket'}
            </h3>
            <p style={{ color: 'rgb(248, 248, 255)' }}>
              {scanResult.message}
            </p>
            {scanResult.data && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <p className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>
                  Ticket: {scanResult.data.ticket_number}
                </p>
                <p className="text-sm" style={{ color: 'rgb(248, 248, 255)' }}>
                  Buyer: {scanResult.data.buyer_name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div 
          className="rounded-2xl p-6 mt-6"
          style={{ backgroundColor: 'rgb(33, 42, 55)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
            Instructions
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'rgb(248, 248, 255)', opacity: 0.8 }}>
            <li>• Green = Valid entry allowed</li>
            <li>• Red = Invalid or already used</li>
            <li>• Yellow = Revoked ticket</li>
            <li>• Enter the 16-character code from ticket</li>
          </ul>
        </div>
      </div>
    </div>
  );
}