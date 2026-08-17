import React, { useState, useEffect } from 'react';
import { QrCode, X, CheckCircle, RefreshCcw, Smartphone } from 'lucide-react';

export default function WhatsAppModal({ isOpen, onClose }) {
  const [status, setStatus] = useState('DISCONNECTED');
  const [qrImage, setQrImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/whatsapp/status');
      const data = await res.json();
      setStatus(data.status);
      if (data.status === 'QR_READY' && data.qr_available) {
        fetchQr();
      }
    } catch (err) {
      console.error("WhatsApp Gateway Offline");
      setStatus('OFFLINE');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQr = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/whatsapp/qr');
      const data = await res.json();
      if (data.qr_image) {
        setQrImage(data.qr_image);
      }
    } catch (err) {
      console.error("Failed to fetch QR");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-surfaceHover">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal" />
            <h3 className="font-semibold text-navy">WhatsApp Alert Gateway</h3>
          </div>
          <button onClick={onClose} className="p-1 text-textMuted hover:text-navy hover:bg-border rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center text-textMuted">
              <RefreshCcw className="w-8 h-8 animate-spin mb-4" />
              <p>Checking gateway status...</p>
            </div>
          ) : status === 'CONNECTED' ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-safeBg rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-safe" />
              </div>
              <h4 className="text-lg font-bold text-navy mb-2">Gateway Connected</h4>
              <p className="text-sm text-textMuted max-w-xs">
                The WhatsApp session is active and securely authenticated. The system is ready to dispatch emergency alerts.
              </p>
            </div>
          ) : status === 'QR_READY' && qrImage ? (
            <div className="flex flex-col items-center text-center w-full">
              <h4 className="text-base font-bold text-navy mb-4">Link Device</h4>
              <div className="bg-white p-2 rounded-xl border border-border shadow-sm mb-4">
                <img src={qrImage} alt="WhatsApp QR Code" className="w-48 h-48" />
              </div>
              <ol className="text-sm text-textMuted text-left list-decimal list-inside space-y-1">
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Menu</strong> or <strong>Settings</strong></li>
                <li>Select <strong>Linked Devices</strong></li>
                <li>Point your phone to this screen to capture the code</li>
              </ol>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-dangerousBg rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-dangerous" />
              </div>
              <h4 className="text-lg font-bold text-navy mb-2">Gateway Offline</h4>
              <p className="text-sm text-textMuted max-w-xs">
                The WhatsApp Baileys Gateway microservice is currently unreachable. Please ensure the Docker container is running.
              </p>
              <button onClick={fetchStatus} className="mt-6 flex items-center gap-2 px-4 py-2 bg-surfaceHover border border-border rounded text-sm font-medium text-navy hover:bg-slate-100 transition-colors">
                <RefreshCcw className="w-4 h-4" /> Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
