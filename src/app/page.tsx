'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useChat } from '@/hooks/useApi';
import { Send, Bot, User, ChevronDown, ChevronUp, X } from 'lucide-react';

interface UsageDetails {
  input_tokens: number;
  output_tokens: number;
  thought_tokens?: number;
  message_count: number;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  usage?: UsageDetails;
  conversationId?: number;
}

interface NotificationItem {
  id: string;
  member_name: string;
  message: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [threadId, setThreadId] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [expandedUsage, setExpandedUsage] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChat();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Temporary user ID - in a real app, this would come from authentication
  const userId = 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    try {
      const response = await chatMutation.mutateAsync({
        user_id: userId,
        message: currentMessage,
        thread_id: threadId,
        model: selectedModel,
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.reply,
        isUser: false,
        timestamp: new Date(),
        usage: {
          input_tokens: response.input_tokens,
          output_tokens: response.output_tokens,
          thought_tokens: response.thought_tokens,
          message_count: response.message_count,
        },
        conversationId: response.conversation_id,
      };

      setMessages(prev => [...prev, botMessage]);
      setThreadId(response.thread_id);

      // Handle optional notifications list from chat response
      const responseNotifications = (response?.notifications ?? []) as Array<{
        member_name?: string;
        message?: string;
      }>;
      if (Array.isArray(responseNotifications) && responseNotifications.length > 0) {
        const base = Date.now();
        const mapped: NotificationItem[] = responseNotifications
          .filter(n => n && (n.member_name || n.message))
          .map((n, i) => ({
            id: `${base}-${i}`,
            member_name: String(n.member_name ?? ''),
            message: String(n.message ?? ''),
          }));
        if (mapped.length > 0) setNotifications(mapped);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    // Clear chat when model is switched
    setMessages([]);
    setThreadId(undefined);
  };

  const toggleUsageDetails = (messageId: string) => {
    setExpandedUsage(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatTokenCount = (count: number | undefined | null) => {
    if (!count || count === 0) {
      return '0';
    }
    return count.toLocaleString();
  };

  // Render minimal inline markdown for bold text (**text**), safely as React nodes
  const renderInlineMarkdown = (text: string) => {
    const nodes: ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, boldText] = match;
      const startIndex = match.index;
      if (startIndex > lastIndex) {
        nodes.push(text.slice(lastIndex, startIndex));
      }
      nodes.push(<strong key={`b-${startIndex}`}>{boldText}</strong>);
      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    // If no markdown was found, return the original string for performance
    if (nodes.length === 0) return text;
    return nodes;
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome to Task Manager</h1>
        <p className="text-muted-foreground mt-2">
          Chat with our AI assistant to get help with your tasks and projects.
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <label htmlFor="model-select" className="text-sm font-medium text-foreground">
            AI Model:
          </label>
          <Select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            className="w-48"
          >
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gpt-4.1">GPT-4.1</option>
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-5-mini">GPT-5 Mini</option>
            <option value="o3-mini">O3 Mini</option>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-card rounded-lg border shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation by typing a message below.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{renderInlineMarkdown(message.content)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs ${
                        message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {!message.isUser && message.conversationId && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          message.isUser ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}>
                          Conv #{message.conversationId}
                        </span>
                      )}
                    </div>
                    {!message.isUser && message.usage && (
                      <button
                        onClick={() => toggleUsageDetails(message.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                      >
                        <span>Usage</span>
                        {expandedUsage.has(message.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {!message.isUser && message.usage && expandedUsage.has(message.id) && (
                    <div className="mt-2 p-2 bg-background/50 rounded border text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Input:</span> {formatTokenCount(message.usage.input_tokens)}
                        </div>
                        <div>
                          <span className="font-medium">Output:</span> {formatTokenCount(message.usage.output_tokens)}
                        </div>
                        {message.usage.thought_tokens && (
                          <div>
                            <span className="font-medium">Thought:</span> {formatTokenCount(message.usage.thought_tokens)}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Messages:</span> {message.usage.message_count}
                        </div>
                      </div>
                      <div className="mt-1 pt-1 border-t border-border/50">
                        <span className="font-medium">Total:</span> {formatTokenCount(
                          message.usage.input_tokens + 
                          message.usage.output_tokens + 
                          (message.usage.thought_tokens || 0)
                        )} tokens
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              loading={chatMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {notifications.length > 0 && (
        <div className="mt-4 space-y-2">
          {notifications.map(n => (
            <div key={n.id} className="flex items-start justify-between rounded-md border bg-accent/30 text-foreground px-3 py-2">
              <div className="text-sm">
                <span className="font-medium">To: {n.member_name || 'Member'}</span>
                {n.message && <span className="ml-2">{n.message}</span>}
              </div>
              <button
                aria-label="Dismiss notification"
                className="ml-3 text-muted-foreground hover:text-foreground"
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
