'use client';

import { useState, useRef, useEffect } from 'react';
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
  Calendar,
  Bot,
  User
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  detectedTasks?: DetectedTask[];
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const detectTasksMutation = useDetectTasks();
  const createTaskMutation = useCreateTask();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDetectTasks = async () => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setText('');

    setIsAnalyzing(true);
    try {
      const result = await detectTasksMutation.mutateAsync({ text, source });
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response || 'I found some potential tasks in your text.',
        timestamp: new Date(),
        detectedTasks: result.detected_tasks || [],
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error detecting tasks:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while analyzing your text. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

      // Update the message to remove the created task
      setMessages(prev => prev.map(msg => {
        if (msg.detectedTasks) {
          return {
            ...msg,
            detectedTasks: msg.detectedTasks.filter(task => task !== detectedTask)
          };
        }
        return msg;
      }));
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
                  <p className="font-medium text-blue-600">• Works best when deadlines and team member names are mentioned</p>
                </>
              )}
              {source === 'whatsapp' && (
                <>
                  <p>• Processes WhatsApp messages for task identification</p>
                  <p>• Recognizes informal task requests and reminders</p>
                  <p>• Handles emoji and informal language patterns</p>
                  <p className="font-medium text-blue-600">• Works best when deadlines and team member names are mentioned</p>
                </>
              )}
              {source === 'general' && (
                <>
                  <p>• General text analysis for task detection</p>
                  <p>• Works with any text content including documents</p>
                  <p>• Identifies action items and project requirements</p>
                  <p className="font-medium text-blue-600">• Works best when deadlines and team member names are mentioned</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 h-[600px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">AI Task Detection Chat</h2>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation by pasting your text and clicking &quot;Detect Tasks&quot;.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {/* Detected Tasks */}
                        {message.detectedTasks && message.detectedTasks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.detectedTasks.map((task, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 text-gray-900 border">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium mb-1">{task.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">
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
                                    className="ml-2"
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
                    </div>
                  </div>
                ))
              )}
              {isAnalyzing && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm text-gray-600">Analyzing your text...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
