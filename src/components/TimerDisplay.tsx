import { TimerMode } from '../hooks/useTimer';

interface TimerDisplayProps {
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
}

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const modeColors: Record<TimerMode, { bg: string; ring: string; text: string; btn: string }> = {
  focus: {
    bg: 'from-rose-500 to-orange-500',
    ring: 'stroke-rose-400',
    text: 'text-rose-50',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
  },
  shortBreak: {
    bg: 'from-emerald-500 to-teal-500',
    ring: 'stroke-emerald-400',
    text: 'text-emerald-50',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
  },
  longBreak: {
    bg: 'from-blue-500 to-indigo-500',
    ring: 'stroke-blue-400',
    text: 'text-blue-50',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
  },
};

export default function TimerDisplay({
  mode,
  timeLeft,
  totalTime,
  isRunning,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
}: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = modeColors[mode];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Tabs */}
      <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1.5">
        {(Object.keys(modeLabels) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onSwitchMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === m
                ? 'bg-white/25 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center">
        <svg className="w-72 h-72 -rotate-90" viewBox="0 0 300 300">
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            className={`${colors.ring} transition-all duration-500`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute flex flex-col items-center">
          <span className={`text-7xl font-mono font-bold tracking-tight ${colors.text}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-white/60 text-sm mt-2 uppercase tracking-widest">
            {modeLabels[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${colors.btn} backdrop-blur-sm`}
          title="Reset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={isRunning ? onPause : onStart}
          className="w-16 h-16 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            const modes: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];
            const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
            onSwitchMode(modes[nextIdx]);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${colors.btn} backdrop-blur-sm`}
          title="Skip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
