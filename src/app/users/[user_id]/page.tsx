'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useUserPerformanceSummary, useAssignedTasks, useCreatedTasks } from '@/hooks/useApi';
import { Task } from '@/lib/api';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Mail,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const userId = parseInt(params.user_id as string);

  const { data: user, isLoading, error } = useUser(userId);
  const { data: performance } = useUserPerformanceSummary(userId);
  const { data: assignedTasks } = useAssignedTasks(userId);
  const { data: createdTasks } = useCreatedTasks(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">User not found or error loading user.</p>
        <Link href="/users">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return <Award className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair': return <Target className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">User Profile & Performance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/users/${user.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {user.is_active ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                user.is_active ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
              {user.is_admin && (
                <>
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Admin</span>
                </>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          {performance && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Total Tasks</h3>
                  </div>
                  <p className="text-2xl font-bold">{performance.tasks_completed_total}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h3 className="font-medium text-sm">On-Time Rate</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.round(performance.on_time_completion_rate * 100)}%
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm">Avg. Completion</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {performance.average_completion_time?.toFixed(1) || 'N/A'} days
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <h3 className="font-medium text-sm">Priority Rate</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.round(performance.priority_completion_rate * 100)}%
                  </p>
                </div>
              </div>

              {performance.overall_rating && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getRatingIcon(performance.overall_rating)}
                    <h3 className="font-medium">Overall Rating</h3>
                  </div>
                  <p className={`text-lg font-semibold mt-1 ${getRatingColor(performance.overall_rating)}`}>
                    {performance.overall_rating.charAt(0).toUpperCase() + performance.overall_rating.slice(1)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Assigned Tasks */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>
            
            {assignedTasks && assignedTasks.length > 0 ? (
              <div className="space-y-3">
                {assignedTasks.slice(0, 5).map((task: Task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {assignedTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href={`/users/${user.id}/tasks`}>
                      <Button variant="outline" size="sm">
                        View All {assignedTasks.length} Tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks assigned to this user.</p>
            )}
          </div>

          {/* Created Tasks */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Created Tasks</h2>
            
            {createdTasks && createdTasks.length > 0 ? (
              <div className="space-y-3">
                {createdTasks.slice(0, 5).map((task: Task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {createdTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href={`/users/${user.id}/created-tasks`}>
                      <Button variant="outline" size="sm">
                        View All {createdTasks.length} Created Tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks created by this user.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Assigned Tasks</span>
                <span className="font-medium">{assignedTasks?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created Tasks</span>
                <span className="font-medium">{createdTasks?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed Tasks</span>
                <span className="font-medium">
                  {assignedTasks?.filter((t: Task) => t.status === 'completed').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Tasks</span>
                <span className="font-medium">
                  {assignedTasks?.filter((t: Task) => t.status === 'in_progress').length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">User created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(user.updated_at), 'MMM dd, yyyy HH:mm')}
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
