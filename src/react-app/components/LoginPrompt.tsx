import { useAuth } from '@getmocha/users-service/react';
import { LogIn, TrendingUp, Shield, Sparkles } from 'lucide-react';

export default function LoginPrompt() {
  const { redirectToLogin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="max-w-lg w-full relative z-10 animate-slideInUp">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extralight text-white/95 mb-3 tracking-wide">Breath</h1>
            <p className="text-white/60 text-sm">Intelligent breathing training</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white/90 font-medium text-sm mb-1">AI-Powered Progress Tracking</h3>
                <p className="text-white/50 text-xs">Advanced analytics that monitor your lung capacity improvement over time</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white/90 font-medium text-sm mb-1">Adaptive Workouts</h3>
                <p className="text-white/50 text-xs">Sessions automatically adjust to your performance and comfort level</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-white/90 font-medium text-sm mb-1">Secure Cloud Sync</h3>
                <p className="text-white/50 text-xs">Your progress is saved and synced across all your devices</p>
              </div>
            </div>
          </div>

          {/* Sign in button */}
          <button
            onClick={redirectToLogin}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center space-x-2 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Sign in with Google</span>
          </button>

          <p className="text-white/40 text-xs text-center mt-6">
            Your breathing data is private and encrypted. We never share your information.
          </p>
        </div>

        <p className="text-white/30 text-xs text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
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
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}
