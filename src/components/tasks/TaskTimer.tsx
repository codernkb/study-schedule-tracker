import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Task } from '../../types';
import { useTask } from '../../contexts/TaskContext';

interface TaskTimerProps {
  task: Task;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ task }) => {
  const { updateTask } = useTask();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task.actualTime * 60); // Convert minutes to seconds
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const totalElapsed = task.actualTime * 60 + Math.floor((now - startTime) / 1000);
        setElapsedTime(totalElapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, task.actualTime]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    if (task.status === 'pending') {
      updateTask(task.id, { status: 'in-progress' });
    }
  };

  const handlePause = () => {
    if (isRunning && startTime) {
      const sessionTime = Math.floor((Date.now() - startTime) / 1000);
      const newActualTime = Math.floor((task.actualTime * 60 + sessionTime) / 60);
      updateTask(task.id, { actualTime: newActualTime });
    }
    setIsRunning(false);
    setStartTime(null);
  };

  const handleStop = () => {
    if (isRunning && startTime) {
      const sessionTime = Math.floor((Date.now() - startTime) / 1000);
      const newActualTime = Math.floor((task.actualTime * 60 + sessionTime) / 60);
      updateTask(task.id, { 
        actualTime: newActualTime,
        status: 'completed'
      });
    }
    setIsRunning(false);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = task.estimatedTime > 0 
    ? Math.min((elapsedTime / (task.estimatedTime * 60)) * 100, 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">Timer</span>
        </div>
        <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex space-x-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={task.status === 'completed'}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={handleStop}
          disabled={task.status === 'completed'}
          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Square className="w-4 h-4" />
          <span>Complete</span>
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Estimated: {task.estimatedTime} min | Actual: {Math.floor(elapsedTime / 60)} min
      </div>
    </div>
  );
};

export default TaskTimer;