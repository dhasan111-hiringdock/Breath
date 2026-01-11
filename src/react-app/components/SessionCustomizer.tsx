import { useState } from 'react';
import { X, Clock, Sliders } from 'lucide-react';
import { BreathingMode } from '@/react-app/pages/Home';

interface SessionCustomizerProps {
  mode: BreathingMode;
  onStart: (duration?: number) => void;
  onCancel: () => void;
}

export default function SessionCustomizer({ mode, onStart, onCancel }: SessionCustomizerProps) {
  const defaultDurations = {
    daily: 360,
    reset: 60,
    silent: 360
  };

  const [duration, setDuration] = useState(defaultDurations[mode]);

  const getModeColor = () => {
    const colors = {
      daily: 'from-indigo-500 to-purple-500',
      reset: 'from-cyan-500 to-blue-500',
      silent: 'from-violet-500 to-fuchsia-500'
    };
    return colors[mode];
  };

  const getModeLabel = () => {
    const labels = {
      daily: 'Daily Repatterning',
      reset: 'Breath Reset',
      silent: 'Silent Session'
    };
    return labels[mode];
  };

  const durationOptions = mode === 'reset'
    ? [30, 45, 60, 90, 120]
    : [180, 240, 300, 360, 480, 600];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close button */}
      <button
        onClick={onCancel}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
      >
        <X className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
      </button>

      {/* Content */}
      <div className="max-w-md w-full relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getModeColor()} flex items-center justify-center shadow-lg`}>
                <Sliders className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extralight text-white/95 mb-2 tracking-wide">{getModeLabel()}</h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3" />
            <p className="text-sm text-white/60">Customize your session</p>
          </div>

          {/* Duration selector */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-5 h-5 text-white/60" />
              <h2 className="text-lg font-light text-white">Duration</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {durationOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    duration === d
                      ? `border-white/40 bg-gradient-to-br ${getModeColor()} shadow-lg`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl font-light text-white">{Math.floor(d / 60)}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {d % 60 === 0 ? 'min' : `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, '0')}`}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom slider for fine-tuning */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Fine-tune</span>
                <span className="text-sm text-white/80 font-medium">
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <input
                type="range"
                min={mode === 'reset' ? 30 : 120}
                max={mode === 'reset' ? 180 : 720}
                step={15}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, rgba(99, 102, 241, 0.6) 0%, rgba(99, 102, 241, 0.6) ${((duration - (mode === 'reset' ? 30 : 120)) / ((mode === 'reset' ? 180 : 720) - (mode === 'reset' ? 30 : 120))) * 100}%, rgba(255, 255, 255, 0.1) ${((duration - (mode === 'reset' ? 30 : 120)) / ((mode === 'reset' ? 180 : 720) - (mode === 'reset' ? 30 : 120))) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
              />
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={() => onStart(duration)}
            className={`w-full py-5 rounded-2xl bg-gradient-to-r ${getModeColor()} text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg`}
          >
            Begin Session
          </button>
        </div>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}
