'use client';

import { useTeamPerformanceSummary, useAnalyticsTrends, useAnalyticsPatterns } from '@/hooks/useApi';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  Target,
  Award
} from 'lucide-react';

interface TeamMemberPerformance {
  user_id: number;
  user_name: string;
  tasks_completed_total: number;
  on_time_completion_rate: number;
  average_completion_time?: number;
  overall_rating: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PerformanceTrend {
  period: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

interface PerformancePattern {
  pattern_type: 'low_completion' | 'high_performance' | 'consistent';
  user_name: string;
  description: string;
  confidence: number;
}

export default function AnalyticsPage() {
  const { data: teamPerformance, isLoading: teamLoading } = useTeamPerformanceSummary();
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends('weekly');
  const { data: patterns, isLoading: patternsLoading } = useAnalyticsPatterns();

  if (teamLoading || trendsLoading || patternsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Team performance insights and trends
        </p>
      </div>

      {/* Team Performance Overview */}
      {teamPerformance && teamPerformance.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Team Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamPerformance.map((member: TeamMemberPerformance) => (
              <div key={member.user_id} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm">{member.user_name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Tasks:</span>
                    <span className="font-medium">{member.tasks_completed_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On-Time Rate:</span>
                    <span className="font-medium">{Math.round(member.on_time_completion_rate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Completion:</span>
                    <span className="font-medium">{member.average_completion_time?.toFixed(1) || 'N/A'} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className={`font-medium ${
                      member.overall_rating === 'excellent' ? 'text-green-600' :
                      member.overall_rating === 'good' ? 'text-blue-600' :
                      member.overall_rating === 'fair' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {member.overall_rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trends */}
      {trends && trends.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
          
          <div className="space-y-4">
            {trends.map((trend: PerformanceTrend, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{trend.period}</h3>
                    <p className="text-sm text-muted-foreground">
                      {trend.total_tasks} total tasks, {trend.completed_tasks} completed
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(trend.completion_rate * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Patterns */}
      {patterns && patterns.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Patterns</h2>
          
          <div className="space-y-3">
            {patterns.map((pattern: PerformancePattern, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {pattern.pattern_type === 'low_completion' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {pattern.pattern_type === 'high_performance' && (
                    <Award className="h-5 w-5 text-green-600" />
                  )}
                  {pattern.pattern_type === 'consistent' && (
                    <Target className="h-5 w-5 text-blue-600" />
                  )}
                  
                  <div>
                    <h3 className="font-medium">{pattern.user_name}</h3>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(pattern.confidence * 100)}% confidence
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pattern.pattern_type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Overall Performance</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {teamPerformance && teamPerformance.length > 0 
              ? Math.round(teamPerformance.reduce((acc: number, member: TeamMemberPerformance) => acc + member.on_time_completion_rate, 0) / teamPerformance.length * 100)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Average on-time completion</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Active Team Members</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {teamPerformance?.length || 0}
          </p>
          <p className="text-sm text-muted-foreground">Team members with performance data</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Total Tasks Completed</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {teamPerformance?.reduce((acc: number, member: TeamMemberPerformance) => acc + member.tasks_completed_total, 0) || 0}
          </p>
          <p className="text-sm text-muted-foreground">Across all team members</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="font-medium">Average Completion Time</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {teamPerformance && teamPerformance.length > 0
              ? (teamPerformance.reduce((acc: number, member: TeamMemberPerformance) => acc + (member.average_completion_time || 0), 0) / teamPerformance.length).toFixed(1)
              : 'N/A'} days
          </p>
          <p className="text-sm text-muted-foreground">Team average</p>
        </div>
      </div>
    </div>
  );
}
