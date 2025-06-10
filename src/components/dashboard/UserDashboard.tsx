import React, { useState, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, Target, Filter, Plus, BarChart3 } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, subDays, subWeeks } from 'date-fns';
import CircularProgress from '../charts/CircularProgress';
import { BarChart, LineChart, PieChart } from '../charts/Charts';
import HeatMap from '../charts/HeatMap';
import TaskForm from '../tasks/TaskForm';
import TaskList from '../tasks/TaskList';

const UserDashboard: React.FC = () => {
  const { getUserTasks, getTaskStats } = useTask();
  const { user } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [dateRange, setDateRange] = useState('7'); // days
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'analytics'>('overview');

  const userTasks = user ? getUserTasks(user.id) : [];
  const today = new Date();
  const startDate = format(subDays(today, parseInt(dateRange)), 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  const stats = useMemo(() => {
    if (!user) return null;
    return getTaskStats(user.id, { start: startDate, end: endDate });
  }, [user, getTaskStats, startDate, endDate]);

  // Weekly completion trend data
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

    const data = weeks.map(week => {
      const weekStats = user ? getTaskStats(user.id, { start: week.start, end: week.end }) : null;
      return weekStats ? weekStats.completionRate : 0;
    });

    return {
      labels: weeks.map(w => w.label),
      datasets: [{
        label: 'Completion Rate (%)',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [user, getTaskStats, today]);

  // Time estimation vs actual comparison
  const timeComparisonData = useMemo(() => {
    const recentTasks = userTasks
      .filter(task => task.status === 'completed' && task.actualTime > 0)
      .slice(-10);

    return {
      labels: recentTasks.map(task => task.name.substring(0, 15) + '...'),
      datasets: [
        {
          label: 'Estimated Time (min)',
          data: recentTasks.map(task => task.estimatedTime),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
        {
          label: 'Actual Time (min)',
          data: recentTasks.map(task => task.actualTime),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
        }
      ]
    };
  }, [userTasks]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorityCounts = userTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: ['High Priority', 'Medium Priority', 'Low Priority'],
      datasets: [{
        data: [
          priorityCounts.high || 0,
          priorityCounts.medium || 0,
          priorityCounts.low || 0
        ],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#10B981'
        ],
        borderWidth: 0,
      }]
    };
  }, [userTasks]);

  // Heat map data
  const heatMapData = useMemo(() => {
    const data: { [date: string]: number } = {};
    userTasks.forEach(task => {
      data[task.date] = (data[task.date] || 0) + 1;
    });
    return data;
  }, [userTasks]);

  const todaysTasks = userTasks.filter(task => task.date === format(today, 'yyyy-MM-dd'));

  if (!user || !stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your study progress and manage your tasks effectively
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tasks', label: 'Tasks', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Hours</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round(stats.totalActualTime / 60 * 10) / 10}h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round(stats.averageAccuracy)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Completion Rate</h3>
              <CircularProgress
                percentage={stats.completionRate}
                size={150}
                color="#10B981"
                label="Tasks Completed"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
              <PieChart data={priorityData} height={200} />
            </div>
          </div>

          {/* Today's Tasks Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {todaysTasks.filter(t => t.status === 'completed').length} of {todaysTasks.length} completed
              </span>
            </div>
            
            {todaysTasks.length > 0 ? (
              <div className="space-y-3">
                {todaysTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({task.category})</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.startTime} - {task.endTime}
                    </div>
                  </div>
                ))}
                {todaysTasks.length > 5 && (
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-2"
                  >
                    View all {todaysTasks.length} tasks
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tasks scheduled for today</p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Add your first task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && <TaskList />}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Completion Trend</h3>
              <LineChart data={weeklyTrendData} height={250} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Estimation vs Actual</h3>
              <BarChart data={timeComparisonData} height={250} />
            </div>
          </div>

          <HeatMap data={heatMapData} />
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <TaskForm onClose={() => setShowTaskForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;