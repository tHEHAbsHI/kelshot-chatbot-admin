'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTasks, useDeleteTask } from '@/hooks/useApi';
import { format } from 'date-fns';
import { 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Flag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TaskListSkeleton } from '@/components/ui/task-skeleton';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function TasksPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    deadline_before: '',
    deadline_after: '',
    created_before: '',
    created_after: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: tasksData, isLoading, error } = useTasks();
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasksData?.tasks?.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    
    const taskDeadline = new Date(task.deadline);
    if (filters.deadline_before && taskDeadline > new Date(filters.deadline_before)) return false;
    if (filters.deadline_after && taskDeadline < new Date(filters.deadline_after)) return false;
    
    const taskCreated = new Date(task.created_at);
    if (filters.created_before && taskCreated > new Date(filters.created_before)) return false;
    if (filters.created_after && taskCreated < new Date(filters.created_after)) return false;
    
    return true;
  }) || [];

  // Pagination logic
  const totalTasks = filteredTasks.length;
  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          <Link href="/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Tasks</h3>
          </div>
          <TaskListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Filter className="h-4 w-4 mr-2" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline Before</label>
            <Input
              type="date"
              value={filters.deadline_before}
              onChange={(e) => setFilters(prev => ({ ...prev, deadline_before: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline After</label>
            <Input
              type="date"
              value={filters.deadline_after}
              onChange={(e) => setFilters(prev => ({ ...prev, deadline_after: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Created Before</label>
            <Input
              type="date"
              value={filters.created_before}
              onChange={(e) => setFilters(prev => ({ ...prev, created_before: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Created After</label>
            <Input
              type="date"
              value={filters.created_after}
              onChange={(e) => setFilters(prev => ({ ...prev, created_after: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setFilters({
              status: '',
              priority: '',
              deadline_before: '',
              deadline_after: '',
              created_before: '',
              created_after: '',
            })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            Tasks ({totalTasks})
          </h3>
        </div>
        
        <div className="divide-y">
          {currentTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No tasks found matching your filters.</p>
            </div>
          ) : (
            currentTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Assigned to: {task.assigned_to}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        <span>Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/tasks/${task.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deleteTaskMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalTasks)} of {totalTasks} tasks
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
