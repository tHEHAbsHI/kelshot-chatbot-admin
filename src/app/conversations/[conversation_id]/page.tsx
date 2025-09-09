'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { apiService, Conversation, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, User, Bot, Calendar, Hash, MessageSquare } from 'lucide-react';

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = Number(params.conversation_id);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch conversation details
        const convData = await apiService.getConversation(conversationId);
        setConversation(convData);
        
        // Fetch messages
        setMessagesLoading(true);
        const messagesData = await apiService.getConversationMessages(conversationId, {
          skip: 0,
          limit: 100
        });
        // Handle both array response and object with messages property
        const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData.messages;
        setMessages(messagesArray || []);
      } catch (err) {
        console.error('Error fetching conversation data:', err);
        setError('Failed to load conversation. Please try again.');
      } finally {
        setLoading(false);
        setMessagesLoading(false);
      }
    };

    if (conversationId) {
      fetchData();
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    // Create the user message outside try block so it's accessible in catch
    const userMessage: Message = {
      id: Date.now(), // Temporary ID
      conversation_id: conversationId,
      content: newMessage.trim(),
      is_user_message: true,
      input_tokens: newMessage.trim().split(' ').length,
      output_tokens: 0,
      created_at: new Date().toISOString()
    };

    try {
      setSending(true);
      
      // Add the user message immediately to the UI
      setMessages(prev => [...(prev || []), userMessage]);
      setNewMessage('');
      
      // Send message to API
      const response = await apiService.addMessage(conversationId, {
        content: newMessage.trim(),
        is_user_message: true,
        input_tokens: userMessage.input_tokens,
        output_tokens: 0
      });
      
      // Update the message with the real ID from the server
      setMessages(prev => (prev || []).map(msg => 
        msg.id === userMessage.id ? response : msg
      ));
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the temporary message on error
      setMessages(prev => (prev || []).filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTokens = (tokens: number | undefined | null) => {
    if (!tokens || tokens === 0) {
      return '0';
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Conversation</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            {conversation?.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              User {conversation?.user_id}
            </div>
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {conversation?.thread_id}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {conversation && formatDate(conversation.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Token Usage Summary */}
      {conversation && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium">Input Tokens</div>
            <div className="text-2xl font-bold text-blue-800">
              {formatTokens(conversation.input_tokens || 0)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-medium">Output Tokens</div>
            <div className="text-2xl font-bold text-green-800">
              {formatTokens(conversation.output_tokens || 0)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 font-medium">Thought Tokens</div>
            <div className="text-2xl font-bold text-purple-800">
              {formatTokens(conversation.thought_tokens || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="border rounded-lg p-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No messages yet. Start the conversation below!
          </div>
        ) : (
          <div className="space-y-4">
            {messages && messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.is_user_message ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.is_user_message 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {message.is_user_message ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`flex-1 ${message.is_user_message ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.is_user_message
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.is_user_message ? 'text-right' : ''
                  }`}>
                    {formatDate(message.created_at)}
                    {(message.input_tokens || 0) > 0 && (
                      <span className="ml-2">
                        ({formatTokens(message.input_tokens)} tokens)
                      </span>
                    )}
                    {(message.output_tokens || 0) > 0 && (
                      <span className="ml-2">
                        ({formatTokens(message.output_tokens)} tokens)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1"
        />
        <Button type="submit" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}
    </div>
  );
}
