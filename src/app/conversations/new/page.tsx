'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus } from 'lucide-react';

export default function NewConversationPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState(1); // Default user ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Conversation title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const conversation = await apiService.createConversation(userId, title.trim());
      
      // Redirect to the new conversation
      router.push(`/conversations/${conversation.id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">New Conversation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <Input
            id="userId"
            type="number"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            min="1"
            required
            className="max-w-xs"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Conversation Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter conversation title..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Give your conversation a descriptive title
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !title.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Conversation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
