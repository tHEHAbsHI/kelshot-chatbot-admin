import axios from 'axios';

// API base URL - using relative path for Vercel proxy
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Create axios instance with better error handling
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Types based on API documentation
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: number;
  created_by: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  thread_id: string;
  title: string;
  input_tokens: number;
  output_tokens: number;
  thought_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  is_user_message: boolean;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface PerformanceEvaluation {
  id: number;
  user_id: number;
  tasks_completed_total: number;
  tasks_completed_on_time: number;
  average_task_completion_time: number;
  task_priority_completion_rate: number;
  overall_rating: 'poor' | 'fair' | 'good' | 'excellent';
  last_updated: string;
}

export interface DetectedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_deadline: string | null;
  confidence: number;
}

// API functions
export const apiService = {
  // Users
  getUsers: async (params?: {
    skip?: number;
    limit?: number;
    role?: string;
    department?: string;
    is_active?: boolean;
  }) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  getUser: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  getUserTasks: async (userId: number) => {
    const response = await api.get(`/users/${userId}/tasks`);
    return response.data;
  },

  // Tasks
  getTasks: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assigned_to?: number;
    created_by?: number;
  }) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  getTask: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, createdByUserId: number) => {
    const response = await api.post(`/tasks/?created_by_user_id=${createdByUserId}`, taskData);
    return response.data;
  },

  updateTask: async (taskId: number, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId: number) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  getAssignedTasks: async (userId: number) => {
    const response = await api.get(`/tasks/assigned/${userId}`);
    return response.data;
  },

  getCreatedTasks: async (userId: number) => {
    const response = await api.get(`/tasks/created/${userId}`);
    return response.data;
  },

  getSimilarTasks: async (taskId: number, limit?: number) => {
    const response = await api.get(`/tasks/${taskId}/similar`, { params: { limit } });
    return response.data;
  },

  searchTasksSemantic: async (query: string, limit?: number) => {
    const response = await api.post('/tasks/search/semantic', { query, limit });
    return response.data;
  },

  // Conversations
  getConversations: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
  }) => {
    const response = await api.get('/conversations/', { params });
    return response.data;
  },

  createConversation: async (userId: number, title: string) => {
    const response = await api.post(`/conversations/?user_id=${userId}`, { title });
    return response.data;
  },

  getConversation: async (conversationId: number) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  getConversationMessages: async (conversationId: number, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  addMessage: async (conversationId: number, messageData: {
    content: string;
    is_user_message: boolean;
    input_tokens: number;
    output_tokens: number;
  }) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },

  chat: async (data: {
    user_id: number;
    message: string;
    thread_id?: string;
    model?: string;
  }) => {
    const response = await api.post('/conversations/chat', data);
    return response.data;
  },

  // Performance
  getPerformanceEvaluations: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    rating?: string;
  }) => {
    const response = await api.get('/performance/evaluations', { params });
    return response.data;
  },

  createPerformanceEvaluation: async (evaluationData: Omit<PerformanceEvaluation, 'id' | 'last_updated'>) => {
    const response = await api.post('/performance/evaluations', evaluationData);
    return response.data;
  },

  getPerformanceEvaluation: async (evaluationId: number) => {
    const response = await api.get(`/performance/evaluations/${evaluationId}`);
    return response.data;
  },

  updatePerformanceEvaluation: async (evaluationId: number, evaluationData: Partial<PerformanceEvaluation>) => {
    const response = await api.put(`/performance/evaluations/${evaluationId}`, evaluationData);
    return response.data;
  },

  deletePerformanceEvaluation: async (evaluationId: number) => {
    const response = await api.delete(`/performance/evaluations/${evaluationId}`);
    return response.data;
  },

  getUserPerformanceSummary: async (userId: number) => {
    const response = await api.get(`/performance/users/${userId}/summary`);
    return response.data;
  },

  getTeamPerformanceSummary: async () => {
    const response = await api.get('/performance/team/summary');
    return response.data;
  },

  // Analytics
  getAnalyticsPatterns: async () => {
    const response = await api.get('/analytics/patterns');
    return response.data;
  },

  getUserAnalytics: async (userId: number) => {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data;
  },

  getAnalyticsTrends: async (period?: string) => {
    const response = await api.get('/analytics/trends', { params: { period } });
    return response.data;
  },

  // Task Detection
  detectTasks: async (text: string, source: 'general' | 'email' | 'whatsapp' = 'general') => {
    const endpoint = source === 'email' ? '/detect/email' : source === 'whatsapp' ? '/detect/whatsapp' : '/detect/tasks';
    const response = await api.post(endpoint, { text, source });
    return response.data;
  },
};
