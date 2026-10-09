import { useState, useEffect, useCallback, useRef } from 'react';
import TimerDisplay from './components/TimerDisplay';
import Settings from './components/Settings';
import Stats from './components/Stats';
import { useTimer, TimerMode } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';

const bgGradients: Record<TimerMode, string> = {
  focus: 'from-rose-600 via-orange-500 to-amber-500',
  shortBreak: 'from-emerald-600 via-teal-500 to-cyan-500',
  longBreak: 'from-blue-600 via-indigo-500 to-purple-500',
};

function App() {
  const [settings, setSettings] = useLocalStorage('pomodoro-settings', {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const timer = useTimer(settings);

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    const modeLabel = timer.mode === 'focus' ? '🎯' : timer.mode === 'shortBreak' ? '☕' : '🌴';
    document.title = `${modeLabel} ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - FocusFlow`;
  }, [timer.timeLeft, timer.mode]);

  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio not available
    }
  }, []);

  // Show notification when mode changes (timer completed)
  const prevModeRef = useRef<TimerMode>(timer.mode);
  useEffect(() => {
    if (prevModeRef.current !== timer.mode && !timer.isRunning) {
      if (timer.mode === 'focus') {
        setNotification('Break time! Great work 🎉');
      } else {
        setNotification('Break over! Time to focus 🎯');
      }
      playNotificationSound();
      const timeout = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timeout);
    }
    prevModeRef.current = timer.mode;
  }, [timer.mode, timer.isRunning, playNotificationSound]);

  const handleSettingsSave = (newSettings: typeof settings) => {
    setSettings(newSettings);
    timer.switchMode(timer.mode);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradients[timer.mode]} transition-all duration-1000 flex flex-col relative overflow-hidden`}>
      {/* Decorative background circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-full px-6 py-3 shadow-xl">
            <p className="text-gray-800 font-medium text-sm">{notification}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="text-lg">🍅</span>
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight">FocusFlow</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              showStats ? 'bg-white/30 shadow-inner' : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Statistics"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        {!showStats ? (
          <div className="animate-in">
            <TimerDisplay
              mode={timer.mode}
              timeLeft={timer.timeLeft}
              totalTime={timer.totalTime}
              isRunning={timer.isRunning}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              onSwitchMode={timer.switchMode}
            />
          </div>
        ) : (
          <div className="animate-in w-full">
            <Stats sessionsCompleted={timer.sessionsCompleted} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 relative z-10">
        <p className="text-white/30 text-xs">
          {timer.mode === 'focus'
            ? 'Stay focused. You got this!'
            : timer.mode === 'shortBreak'
            ? 'Take a breather. Stretch a little.'
            : 'Enjoy your long break. You earned it!'}
        </p>
      </footer>

      {/* Settings Modal */}
      <Settings
        settings={settings}
        onSave={handleSettingsSave}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
