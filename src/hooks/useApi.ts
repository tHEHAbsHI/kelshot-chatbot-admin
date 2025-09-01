import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type User, type Task, type Conversation, type Message, type PerformanceEvaluation, type DetectedTask } from '@/lib/api';

// Users hooks
export const useUsers = (params?: {
  skip?: number;
  limit?: number;
  role?: string;
  department?: string;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiService.getUsers(params),
  });
};

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getUser(userId),
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) =>
      apiService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: Partial<User> }) =>
      apiService.updateUser(userId, userData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUserTasks = (userId: number) => {
  return useQuery({
    queryKey: ['user-tasks', userId],
    queryFn: () => apiService.getUserTasks(userId),
    enabled: !!userId,
  });
};

// Tasks hooks
export const useTasks = (params?: {
  skip?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assigned_to?: number;
  created_by?: number;
}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => apiService.getTasks(params),
  });
};

export const useTask = (taskId: number) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiService.getTask(taskId),
    enabled: !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskData, createdByUserId }: { taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>; createdByUserId: number }) =>
      apiService.createTask(taskData, createdByUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: number; taskData: Partial<Task> }) =>
      apiService.updateTask(taskId, taskData),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => apiService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAssignedTasks = (userId: number) => {
  return useQuery({
    queryKey: ['assigned-tasks', userId],
    queryFn: () => apiService.getAssignedTasks(userId),
    enabled: !!userId,
  });
};

export const useCreatedTasks = (userId: number) => {
  return useQuery({
    queryKey: ['created-tasks', userId],
    queryFn: () => apiService.getCreatedTasks(userId),
    enabled: !!userId,
  });
};

export const useSimilarTasks = (taskId: number, limit?: number) => {
  return useQuery({
    queryKey: ['similar-tasks', taskId, limit],
    queryFn: () => apiService.getSimilarTasks(taskId, limit),
    enabled: !!taskId,
  });
};

export const useSearchTasks = () => {
  return useMutation({
    mutationFn: ({ query, limit }: { query: string; limit?: number }) =>
      apiService.searchTasksSemantic(query, limit),
  });
};

// Conversations hooks
export const useConversations = (params?: {
  skip?: number;
  limit?: number;
  user_id?: number;
}) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => apiService.getConversations(params),
  });
};

export const useConversation = (conversationId: number) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => apiService.getConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useConversationMessages = (conversationId: number, params?: {
  skip?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['conversation-messages', conversationId, params],
    queryFn: () => apiService.getConversationMessages(conversationId, params),
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, title }: { userId: number; title: string }) =>
      apiService.createConversation(userId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, messageData }: {
      conversationId: number;
      messageData: {
        content: string;
        is_user_message: boolean;
        input_tokens: number;
        output_tokens: number;
      };
    }) => apiService.addMessage(conversationId, messageData),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
    },
  });
};

export const useChat = () => {
  return useMutation({
    mutationFn: (data: { user_id: number; message: string; thread_id?: string; model?: string }) =>
      apiService.chat(data),
  });
};

// Performance hooks
export const usePerformanceEvaluations = (params?: {
  skip?: number;
  limit?: number;
  user_id?: number;
  rating?: string;
}) => {
  return useQuery({
    queryKey: ['performance-evaluations', params],
    queryFn: () => apiService.getPerformanceEvaluations(params),
  });
};

export const usePerformanceEvaluation = (evaluationId: number) => {
  return useQuery({
    queryKey: ['performance-evaluation', evaluationId],
    queryFn: () => apiService.getPerformanceEvaluation(evaluationId),
    enabled: !!evaluationId,
  });
};

export const useCreatePerformanceEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluationData: Omit<PerformanceEvaluation, 'id' | 'last_updated'>) =>
      apiService.createPerformanceEvaluation(evaluationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
    },
  });
};

export const useUpdatePerformanceEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evaluationId, evaluationData }: { evaluationId: number; evaluationData: Partial<PerformanceEvaluation> }) =>
      apiService.updatePerformanceEvaluation(evaluationId, evaluationData),
    onSuccess: (_, { evaluationId }) => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['performance-evaluation', evaluationId] });
    },
  });
};

export const useDeletePerformanceEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluationId: number) => apiService.deletePerformanceEvaluation(evaluationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
    },
  });
};

export const useUserPerformanceSummary = (userId: number) => {
  return useQuery({
    queryKey: ['user-performance-summary', userId],
    queryFn: () => apiService.getUserPerformanceSummary(userId),
    enabled: !!userId,
  });
};

export const useTeamPerformanceSummary = () => {
  return useQuery({
    queryKey: ['team-performance-summary'],
    queryFn: () => apiService.getTeamPerformanceSummary(),
  });
};

// Analytics hooks
export const useAnalyticsPatterns = () => {
  return useQuery({
    queryKey: ['analytics-patterns'],
    queryFn: () => apiService.getAnalyticsPatterns(),
  });
};

export const useUserAnalytics = (userId: number) => {
  return useQuery({
    queryKey: ['user-analytics', userId],
    queryFn: () => apiService.getUserAnalytics(userId),
    enabled: !!userId,
  });
};

export const useAnalyticsTrends = (period?: string) => {
  return useQuery({
    queryKey: ['analytics-trends', period],
    queryFn: () => apiService.getAnalyticsTrends(period),
  });
};

// Task Detection hooks
export const useDetectTasks = () => {
  return useMutation({
    mutationFn: ({ text, source }: { text: string; source: 'general' | 'email' | 'whatsapp' }) =>
      apiService.detectTasks(text, source),
  });
};
