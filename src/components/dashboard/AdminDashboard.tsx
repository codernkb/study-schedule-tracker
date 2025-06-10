import React, { useMemo, useState } from 'react';
import { Users, TrendingUp, Clock, Target, Eye, BarChart3 } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { USERS } from '../../data/users';
import { BarChart, LineChart } from '../charts/Charts';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { getTaskStats, getUserTasks } = useTask();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [isLoading, setIsLoading] = useState(false);

  const users = USERS.filter(user => user.role === 'user');
  const today = new Date();
  
  // Calculate date range based on selection
  const { startDate, endDate } = useMemo(() => {
    let start: string, end: string;
    
    if (timeRange === 'monthly') {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      start = format(monthStart, 'yyyy-MM-dd');
      end = format(monthEnd, 'yyyy-MM-dd');
    } else {
      start = format(subDays(today, parseInt(timeRange)), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    }
    
    return { startDate: start, endDate: end };
  }, [timeRange, today]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const allStats = users.map(user => getTaskStats(user.id, { start: startDate, end: endDate }));
    
    return {
      totalUsers: users.length,
      totalTasks: allStats.reduce((sum, stats) => sum + stats.totalTasks, 0),
      totalCompletedTasks: allStats.reduce((sum, stats) => sum + stats.completedTasks, 0),
      totalStudyHours: allStats.reduce((sum, stats) => sum + stats.totalActualTime, 0) / 60,
      averageCompletionRate: allStats.reduce((sum, stats) => sum + stats.completionRate, 0) / users.length,
    };
  }, [users, getTaskStats, startDate, endDate]);

  // User comparison data
  const userComparisonData = useMemo(() => {
    const userData = users.map(user => {
      const stats = getTaskStats(user.id, { start: startDate, end: endDate });
      return {
        user: user.name,
        completionRate: stats.completionRate,
        studyHours: stats.totalActualTime / 60,
        totalTasks: stats.totalTasks,
      };
    });

    return {
      labels: userData.map(data => data.user),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: userData.map(data => data.completionRate),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          yAxisID: 'y',
        },
        {
          label: 'Study Hours',
          data: userData.map(data => data.studyHours),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          yAxisID: 'y1',
        }
      ]
    };
  }, [users, getTaskStats, startDate, endDate]);

  // Weekly productivity trend
  const weeklyTrendData = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(today, 7 - i));
      const weekEnd = endOfWeek(weekStart);
      return {
        label: format(weekStart, 'MMM dd'),
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd')
      };
    });

    const datasets = users.map((user, index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const data = weeks.map(week => {
        const weekStats = getTaskStats(user.id, { start: week.start, end: week.end });
        return weekStats.completionRate;
      });

      return {
        label: user.name,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        fill: false,
      };
    });

    return {
      labels: weeks.map(w => w.label),
      datasets
    };
  }, [users, getTaskStats, today]);

  // Individual user details
  const selectedUserStats = selectedUserId ? getTaskStats(selectedUserId, { start: startDate, end: endDate }) : null;
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;
  const selectedUserTasks = selectedUserId ? getUserTasks(selectedUserId) : [];

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoading(true);
    setTimeout(() => {
      setTimeRange(e.target.value);
      setIsLoading(false);
    }, 500);
  };

  const handleUserDetailsToggle = (userId: string) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-white">Updating data...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor user performance and overall system metrics
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Hours</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(overallStats.totalStudyHours * 10) / 10}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Completion</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(overallStats.averageCompletionRate)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Performance Comparison</h3>
          <BarChart 
            data={userComparisonData} 
            height={300}
            options={{
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Completion Rate (%)',
                    color: 'rgb(156, 163, 175)'
                  },
                  ticks: {
                    color: 'rgb(156, 163, 175)'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Study Hours',
                    color: 'rgb(156, 163, 175)'
                  },
                  ticks: {
                    color: 'rgb(156, 163, 175)'
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              }
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Productivity Trends</h3>
          <LineChart data={weeklyTrendData} height={300} />
        </div>
      </div>

      {/* User Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Study Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => {
                const stats = getTaskStats(user.id, { start: startDate, end: endDate });
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stats.totalTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stats.completedTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {Math.round(stats.completionRate)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {Math.round(stats.totalActualTime / 60 * 10) / 10}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUserDetailsToggle(user.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 cursor-pointer transition-colors transform hover:scale-105"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{selectedUserId === user.id ? 'Hide' : 'View'} Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Details */}
      {selectedUser && selectedUserStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedUser.name}'s Detailed Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedUserStats.totalTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(selectedUserStats.completionRate)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(selectedUserStats.totalActualTime / 60 * 10) / 10}h
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Study Hours</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Recent Tasks</h4>
            {selectedUserTasks.slice(-5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{task.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({task.category})</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(task.date), 'MMM dd, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;