import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
}

export function useTimer(settings: TimerSettings) {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('pomodoro-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isRunning: false };
    }
    return {
      mode: 'focus' as TimerMode,
      timeLeft: settings.focus * 60,
      isRunning: false,
      sessionsCompleted: 0,
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const expectedTimeRef = useRef<number>(0);

  const getTimeForMode = useCallback((mode: TimerMode) => {
    switch (mode) {
      case 'focus': return settings.focus * 60;
      case 'shortBreak': return settings.shortBreak * 60;
      case 'longBreak': return settings.longBreak * 60;
    }
  }, [settings]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  // Timer tick logic
  useEffect(() => {
    if (state.isRunning) {
      startTimeRef.current = Date.now();
      expectedTimeRef.current = state.timeLeft;

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
        const newTimeLeft = expectedTimeRef.current - elapsed;

        if (newTimeLeft <= 0) {
          setState(prev => {
            let nextMode: TimerMode;
            let newSessions = prev.sessionsCompleted;

            if (prev.mode === 'focus') {
              newSessions = prev.sessionsCompleted + 1;
              nextMode = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
              // Log completed focus session
              logFocusSession(settings.focus);
            } else {
              nextMode = 'focus';
            }

            return {
              mode: nextMode,
              timeLeft: getTimeForMode(nextMode),
              isRunning: false,
              sessionsCompleted: newSessions,
            };
          });
        } else {
          setState(prev => ({ ...prev, timeLeft: newTimeLeft }));
        }
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, getTimeForMode, settings.focus]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: getTimeForMode(prev.mode),
      isRunning: false,
    }));
  }, [getTimeForMode]);

  const switchMode = useCallback((mode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode,
      timeLeft: getTimeForMode(mode),
      isRunning: false,
    }));
  }, [getTimeForMode]);

  return {
    ...state,
    start,
    pause,
    reset,
    switchMode,
    totalTime: getTimeForMode(state.mode),
  };
}

function logFocusSession(durationMinutes: number) {
  const today = new Date().toISOString().split('T')[0];
  const stats = JSON.parse(localStorage.getItem('pomodoro-stats') || '{}');

  if (!stats[today]) {
    stats[today] = { sessions: 0, totalMinutes: 0 };
  }

  stats[today].sessions += 1;
  stats[today].totalMinutes += durationMinutes;

  localStorage.setItem('pomodoro-stats', JSON.stringify(stats));
}
