import { useState } from 'react';

interface SettingsProps {
  settings: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  onSave: (settings: { focus: number; shortBreak: number; longBreak: number }) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ settings, onSave, isOpen, onClose }: SettingsProps) {
  const [focus, setFocus] = useState(settings.focus);
  const [shortBreak, setShortBreak] = useState(settings.shortBreak);
  const [longBreak, setLongBreak] = useState(settings.longBreak);

  const handleSave = () => {
    onSave({
      focus: Math.max(1, Math.min(120, focus)),
      shortBreak: Math.max(1, Math.min(30, shortBreak)),
      longBreak: Math.max(1, Math.min(60, longBreak)),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Focus Duration */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Focus Duration</span>
              <span className="text-sm text-gray-500">{focus} min</span>
            </label>
            <input
              type="range"
              min="1"
              max="120"
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Short Break */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Short Break</span>
              <span className="text-sm text-gray-500">{shortBreak} min</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Long Break */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Long Break</span>
              <span className="text-sm text-gray-500">{longBreak} min</span>
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
