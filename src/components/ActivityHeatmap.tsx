import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

interface ActivityDay {
  date: Date;
  count: number;
  dayIndex: number;
}

interface ActivityHeatmapProps {
  checkins: Array<{
    timestamp: number;
    dayIndex: number;
  }>;
  currentStreak: number;
  maxStreak: number;
  className?: string;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  checkins,
  currentStreak,
  maxStreak,
  className = '',
}) => {
  // Generate current month days
  const heatmapData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Create map of dayIndex to count
    const checkinMap = new Map<number, number>();
    checkins.forEach(checkin => {
      // Calculate local day index from timestamp to ensure it matches user's timezone
      const date = new Date(checkin.timestamp * 1000);
      const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const localDayIndex = Math.floor(localMidnight.getTime() / (1000 * 60 * 60 * 24));

      const count = checkinMap.get(localDayIndex) || 0;
      checkinMap.set(localDayIndex, count + 1);
    });

    const days: ActivityDay[] = [];

    // Generate all days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
      const count = checkinMap.get(dayIndex) || 0;

      days.push({ date, count, dayIndex });
    }

    return { days, firstDay: firstDay.getDay(), month, year };
  }, [checkins]);

  // Group by weeks
  const weeks = useMemo(() => {
    const weeksArray: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];

    // Pad start to align with Sunday
    for (let i = 0; i < heatmapData.firstDay; i++) {
      currentWeek.push({
        date: new Date(0),
        count: -1, // Placeholder
        dayIndex: -1,
      });
    }

    heatmapData.days.forEach((day) => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          count: -1,
          dayIndex: -1,
        });
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [heatmapData]);

  // Get color based on count
  const getColor = (count: number): string => {
    if (count === -1) return 'transparent'; // Placeholder
    if (count === 0) return 'bg-gray-800 border-gray-700';
    if (count === 1) return 'bg-cyan-900/40 border-cyan-700';
    if (count === 2) return 'bg-cyan-700 border-cyan-600';
    if (count >= 3) return 'bg-cyan-500 border-cyan-400';
    return 'bg-gray-800';
  };

  // Month and day labels
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate current month stats
  const monthCheckins = checkins.filter(c => {
    const date = new Date(c.timestamp * 1000);
    return date.getMonth() === heatmapData.month && date.getFullYear() === heatmapData.year;
  });
  const uniqueDaysThisMonth = new Set(heatmapData.days.filter(d => d.count > 0).map(d => d.dayIndex)).size;

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-[#0B0E14]/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-cyan-400" />
            <div className="font-bold text-white">
              {months[heatmapData.month]}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {heatmapData.year}
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-lg font-bold text-cyan-400">
              {uniqueDaysThisMonth}
            </div>
            <div className="text-[10px] text-gray-400">Days</div>
          </div>

          <div className="text-center p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center justify-center gap-1">
              <FaFire className="text-sm text-orange-500" />
              <div className="text-lg font-bold text-orange-400">
                {currentStreak}
              </div>
            </div>
            <div className="text-[10px] text-gray-400">Streak</div>
          </div>

          <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-center gap-1">
              <FaTrophy className="text-sm text-purple-500" />
              <div className="text-lg font-bold text-purple-400">
                {maxStreak}
              </div>
            </div>
            <div className="text-[10px] text-gray-400">Best</div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                if (day.count === -1) {
                  return <div key={dayIndex} className="aspect-square" />;
                }

                const isToday = day.date.toDateString() === new Date().toDateString();

                return (
                  <motion.div
                    key={dayIndex}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className={`aspect-square rounded-md border ${getColor(day.count)} cursor-pointer relative group flex items-center justify-center ${isToday ? 'ring-2 ring-cyan-400' : ''
                      }`}
                    title={`${day.date.toLocaleDateString()}: ${day.count} check-in${day.count !== 1 ? 's' : ''}`}
                  >
                    {/* Day number */}
                    <span className={`text-[10px] font-medium ${day.count > 0
                      ? 'text-white'
                      : 'text-gray-600'
                      }`}>
                      {day.date.getDate()}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-bold">
                      <div className="font-semibold">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div>
                        {day.count} check-in{day.count !== 1 ? 's' : ''}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-white" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-gray-400">
            {monthCheckins.length} check-ins
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-sm bg-gray-800 border border-gray-700" />
              <div className="w-2 h-2 rounded-sm bg-cyan-900/40 border border-cyan-700" />
              <div className="w-2 h-2 rounded-sm bg-cyan-700 border border-cyan-600" />
              <div className="w-2 h-2 rounded-sm bg-cyan-500 border border-cyan-400" />
            </div>
            <span className="text-[10px] text-gray-500">More</span>
          </div>
        </div>

        {/* Motivational Message */}
        {currentStreak === 0 && monthCheckins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20"
          >
            <div className="flex items-center gap-2 text-orange-400 text-xs">
              <FaFire />
              <span className="font-medium">
                Start a new streak today! 🔥
              </span>
            </div>
          </motion.div>
        )}

        {currentStreak >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
          >
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <FaTrophy />
              <span className="font-medium">
                {currentStreak}-day streak! 💪
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;