import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const colors = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    error: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
  };

  return (
    <div
      className={`fixed top-8 right-8 z-[9999] transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`bg-gradient-to-br ${colors[type]} backdrop-blur-xl border rounded-2xl p-4 pr-12 shadow-xl max-w-sm`}>
        <div className="flex items-center space-x-3">
          {icons[type]}
          <p className="text-white text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </div>
  );
}
