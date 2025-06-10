import { Task } from '../types';
import { format } from 'date-fns';

export const exportToCSV = (tasks: Task[], filename: string = 'tasks'): void => {
  const headers = [
    'Task Name',
    'Category',
    'Priority',
    'Status', 
    'Date',
    'Start Time',
    'End Time',
    'Estimated Time (mins)',
    'Actual Time (mins)',
    'Created At',
    'Completed At'
  ];

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      `"${task.name}"`,
      `"${task.category}"`,
      task.priority,
      task.status,
      task.date,
      task.startTime,
      task.endTime,
      task.estimatedTime,
      task.actualTime,
      format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      task.completedAt ? format(new Date(task.completedAt), 'yyyy-MM-dd HH:mm:ss') : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};