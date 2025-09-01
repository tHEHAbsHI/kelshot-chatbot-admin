'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useDetectTasks, useCreateTask } from '@/hooks/useApi';
import { 
  Search, 
  FileText, 
  Mail, 
  MessageSquare, 
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Calendar
} from 'lucide-react';

interface DetectedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  estimated_deadline?: string;
}

const sourceOptions = [
  { value: 'general', label: 'General Text', icon: FileText },
  { value: 'email', label: 'Email Content', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp Message', icon: MessageSquare },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function TaskDetectionPage() {
  const [text, setText] = useState('');
  const [source, setSource] = useState<'general' | 'email' | 'whatsapp'>('general');
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectTasksMutation = useDetectTasks();
  const createTaskMutation = useCreateTask();

  const handleDetectTasks = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await detectTasksMutation.mutateAsync({ text, source });
      setDetectedTasks(result.detected_tasks || []);
    } catch (error) {
      console.error('Error detecting tasks:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTask = async (detectedTask: DetectedTask) => {
    try {
      // Temporary user ID - in a real app, this would come from authentication
      const createdByUserId = 1;
      
      await createTaskMutation.mutateAsync({
        taskData: {
          title: detectedTask.title,
          description: detectedTask.description,
          status: 'pending',
          priority: detectedTask.priority,
          assigned_to: 1, // Default assignment
          created_by: createdByUserId,
          deadline: detectedTask.estimated_deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        createdByUserId,
      });

      // Remove the task from the detected list
      setDetectedTasks(prev => prev.filter(task => task !== detectedTask));
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <Clock className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Detection</h1>
        <p className="text-muted-foreground mt-2">
          Analyze text content and automatically detect potential tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Input Text</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source Type</label>
                <Select
                  value={source}
                  onChange={(e) => setSource(e.target.value as 'general' | 'email' | 'whatsapp')}
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Content</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Paste your ${source} content here...`}
                  rows={12}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleDetectTasks}
                disabled={!text.trim() || isAnalyzing}
                loading={isAnalyzing}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Detect Tasks'}
              </Button>
            </div>
          </div>

          {/* Source Information */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-3">About {sourceOptions.find(opt => opt.value === source)?.label}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {source === 'email' && (
                <>
                  <p>• Analyzes email content for action items and deadlines</p>
                  <p>• Extracts tasks from email threads and conversations</p>
                  <p>• Identifies priority based on email urgency indicators</p>
                </>
              )}
              {source === 'whatsapp' && (
                <>
                  <p>• Processes WhatsApp messages for task identification</p>
                  <p>• Recognizes informal task requests and reminders</p>
                  <p>• Handles emoji and informal language patterns</p>
                </>
              )}
              {source === 'general' && (
                <>
                  <p>• General text analysis for task detection</p>
                  <p>• Works with any text content including documents</p>
                  <p>• Identifies action items and project requirements</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Detected Tasks</h2>
            
            {detectedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks detected yet. Paste some text and click &quot;Detect Tasks&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {detectedTasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className={`px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.estimated_deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Deadline: {new Date(task.estimated_deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            {getConfidenceIcon(task.confidence)}
                            <span className={getConfidenceColor(task.confidence)}>
                              {Math.round(task.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleCreateTask(task)}
                        disabled={createTaskMutation.isPending}
                        loading={createTaskMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Task
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Summary */}
          {detectedTasks.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-3">Analysis Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total tasks detected:</span>
                  <span className="font-medium">{detectedTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>High confidence tasks:</span>
                  <span className="font-medium">
                    {detectedTasks.filter(t => t.confidence >= 0.8).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Medium confidence tasks:</span>
                  <span className="font-medium">
                    {detectedTasks.filter(t => t.confidence >= 0.6 && t.confidence < 0.8).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Low confidence tasks:</span>
                  <span className="font-medium">
                    {detectedTasks.filter(t => t.confidence < 0.6).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
