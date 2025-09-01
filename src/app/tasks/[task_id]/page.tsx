'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTask, useSimilarTasks, useDeleteTask } from '@/hooks/useApi';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';

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

const statusIcons = {
  pending: Clock,
  in_progress: Play,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = parseInt(params.task_id as string);

  const { data: task, isLoading, error } = useTask(taskId);
  const { data: similarTasks } = useSimilarTasks(taskId, 5);
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        router.push('/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Task not found or error loading task.</p>
        <Link href="/tasks">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  const StatusIcon = statusIcons[task.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/tasks/${task.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Task Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Deadline</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Assigned To</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>User ID: {task.assigned_to}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Created By</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>User ID: {task.created_by}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Created Date</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    <span>{format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Tasks */}
          {similarTasks && similarTasks.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Tasks</h2>
              <div className="space-y-3">
                {similarTasks.map((similarTask) => (
                  <Link
                    key={similarTask.id}
                    href={`/tasks/${similarTask.id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{similarTask.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {similarTask.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[similarTask.status]}`}>
                          {similarTask.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[similarTask.priority]}`}>
                          {similarTask.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Start Task
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>

          {/* Task History */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Task History</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Task created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.updated_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
