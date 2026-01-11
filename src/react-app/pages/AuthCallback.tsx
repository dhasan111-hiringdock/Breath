import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { exchangeCodeForSessionToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/');
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center animate-fadeIn">
      <div className="text-center">
        <div className="inline-block mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-white/10 border-b-white/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
        </div>
        <p className="text-white/80 text-lg font-light animate-pulse">Completing sign in...</p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
