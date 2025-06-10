import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskContextType, TaskStats } from '../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { format, isWithinInterval, parseISO } from 'date-fns';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = loadFromLocalStorage<Task[]>('tasks', []);
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates };
        if (updates.status === 'completed' && task.status !== 'completed') {
          updatedTask.completedAt = new Date().toISOString();
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getUserTasks = (userId: string) => {
    return tasks.filter(task => task.userId === userId);
  };

  const getTaskStats = (userId: string, dateRange?: { start: string; end: string }): TaskStats => {
    let userTasks = getUserTasks(userId);
    
    if (dateRange) {
      userTasks = userTasks.filter(task => {
        const taskDate = parseISO(task.date);
        return isWithinInterval(taskDate, {
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end)
        });
      });
    }

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalEstimatedTime = userTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
    const totalActualTime = userTasks.reduce((sum, task) => sum + task.actualTime, 0);
    
    const completedTasksWithTime = userTasks.filter(task => 
      task.status === 'completed' && task.actualTime > 0 && task.estimatedTime > 0
    );
    
    const averageAccuracy = completedTasksWithTime.length > 0 
      ? completedTasksWithTime.reduce((sum, task) => {
          const accuracy = Math.min(task.estimatedTime / task.actualTime, task.actualTime / task.estimatedTime) * 100;
          return sum + accuracy;
        }, 0) / completedTasksWithTime.length
      : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalEstimatedTime,
      totalActualTime,
      averageAccuracy
    };
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getUserTasks,
    getTaskStats,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};