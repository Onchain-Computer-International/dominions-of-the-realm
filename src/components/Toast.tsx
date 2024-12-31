import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 z-50">
      <RefreshCw size={16} className="text-blue-500 animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}