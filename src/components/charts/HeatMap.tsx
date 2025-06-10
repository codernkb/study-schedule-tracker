import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from 'date-fns';

interface HeatMapProps {
  data: { [date: string]: number };
  monthsToShow?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({ data, monthsToShow = 6 }) => {
  const today = new Date();
  const months = Array.from({ length: monthsToShow }, (_, i) => subMonths(today, monthsToShow - 1 - i));

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 4) return 'bg-green-300 dark:bg-green-700';
    if (count <= 6) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Heat Map</h3>
      
      <div className="space-y-4">
        {months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
          
          // Group days by week
          const weeks: Date[][] = [];
          let currentWeek: Date[] = [];
          
          // Add empty cells for days before the first day of the month
          const firstDayOfWeek = getDay(monthStart);
          for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(new Date(0)); // Placeholder date
          }

          days.forEach(day => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
              weeks.push(currentWeek);
              currentWeek = [];
            }
          });

          // Add the last partial week if it exists
          if (currentWeek.length > 0) {
            // Fill remaining days with placeholders
            while (currentWeek.length < 7) {
              currentWeek.push(new Date(0));
            }
            weeks.push(currentWeek);
          }

          return (
            <div key={month.toISOString()} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {format(month, 'MMMM yyyy')}
              </h4>
              
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {/* Day labels */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-xs text-gray-500 dark:text-gray-400 w-3 h-3 flex items-center justify-center">
                    {day}
                  </div>
                ))}
                
                {/* Calendar grid */}
                {weeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    const count = day.getTime() === 0 ? 0 : (data[dateString] || 0);
                    const isPlaceholder = day.getTime() === 0;
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm ${
                          isPlaceholder ? '' : getIntensity(count)
                        } ${!isPlaceholder ? 'hover:ring-2 hover:ring-blue-500 cursor-pointer' : ''}`}
                        title={!isPlaceholder ? `${format(day, 'MMM dd, yyyy')}: ${count} tasks` : ''}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 dark:bg-green-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 dark:bg-green-500 rounded-sm"></div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
      </div>
    </div>
  );
};

export default HeatMap;