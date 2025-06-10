export interface User {
  username: string;
  password: string;
  role: 'user' | 'admin';
  id: string;
  name: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  category: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalEstimatedTime: number;
  totalActualTime: number;
  averageAccuracy: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getUserTasks: (userId: string) => Task[];
  getTaskStats: (userId: string, dateRange?: { start: string; end: string }) => TaskStats;
}