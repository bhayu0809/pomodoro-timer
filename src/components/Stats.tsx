interface StatsProps {
  sessionsCompleted: number;
}

interface DayStats {
  sessions: number;
  totalMinutes: number;
}

export default function Stats({ sessionsCompleted }: StatsProps) {
  const today = new Date().toISOString().split('T')[0];
  const stats: Record<string, DayStats> = JSON.parse(
    localStorage.getItem('pomodoro-stats') || '{}'
  );
  const todayStats = stats[today] || { sessions: 0, totalMinutes: 0 };

  // Get last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayStats = stats[dateStr] || { sessions: 0, totalMinutes: 0 };
    return {
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sessions: dayStats.sessions,
      minutes: dayStats.totalMinutes,
    };
  });

  const maxSessions = Math.max(...last7Days.map(d => d.sessions), 1);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6">
        {/* Today's Stats */}
        <div>
          <h3 className="text-white/60 text-xs uppercase tracking-widest mb-4">Today's Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{todayStats.sessions}</div>
              <div className="text-white/50 text-xs mt-1">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{todayStats.totalMinutes}</div>
              <div className="text-white/50 text-xs mt-1">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{sessionsCompleted}</div>
              <div className="text-white/50 text-xs mt-1">Total</div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div>
          <h3 className="text-white/60 text-xs uppercase tracking-widest mb-4">Last 7 Days</h3>
          <div className="flex items-end justify-between gap-2 h-24">
            {last7Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-16">
                  <div
                    className="w-full bg-white/20 rounded-t-sm transition-all duration-500 min-h-[2px]"
                    style={{
                      height: `${(day.sessions / maxSessions) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-white/40 text-[10px]">{day.dayName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational message */}
        {todayStats.sessions > 0 && (
          <div className="text-center">
            <p className="text-white/50 text-sm italic">
              {todayStats.sessions >= 8
                ? '🔥 Amazing focus today!'
                : todayStats.sessions >= 4
                ? '💪 Great work, keep it up!'
                : todayStats.sessions >= 2
                ? '✨ Good start, stay focused!'
                : '🌱 Just getting started!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
