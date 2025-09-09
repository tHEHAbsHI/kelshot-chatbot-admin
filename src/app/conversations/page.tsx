'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, MessageSquare, Calendar, User, Hash } from 'lucide-react';

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const fetchConversations = async (skipValue: number = 0, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getConversations({
        skip: skipValue,
        limit: limit,
        user_id: 1 // Default user ID, you might want to get this from auth context
      });
      
      setConversations(response.conversations);
      setTotal(response.total);
      setSkip(response.page * response.size);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    // For now, we'll just filter client-side since the API doesn't have search
    setSearching(false);
  };

  const handleDelete = async (conversationId: number) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      // Note: The API doesn't have a delete conversation endpoint in the provided docs
      // This would need to be implemented on the backend
      console.log('Delete conversation:', conversationId);
      alert('Delete functionality not yet implemented on the backend');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.thread_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <Button onClick={() => router.push('/conversations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={searching}
          variant="outline"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery ? 'No conversations found matching your search.' : 'No conversations yet.'}
          </div>
          {!searchQuery && (
            <Button onClick={() => router.push('/conversations/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Start your first conversation
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/conversations/${conversation.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {conversation.title}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conversation.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  User {conversation.user_id}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4" />
                  {conversation.thread_id.substring(0, 8)}...
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(conversation.created_at)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-600 font-medium">Input Tokens</div>
                  <div className="text-blue-800">{formatTokens(conversation.input_tokens || 0)}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-600 font-medium">Output Tokens</div>
                  <div className="text-green-800">{formatTokens(conversation.output_tokens || 0)}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-600 font-medium">Thought Tokens</div>
                  <div className="text-purple-800">{formatTokens(conversation.thought_tokens || 0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => fetchConversations(skip - limit, searchQuery)}
            disabled={skip === 0 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchConversations(skip + limit, searchQuery)}
            disabled={skip + limit >= total || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
