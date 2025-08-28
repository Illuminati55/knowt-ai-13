import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  title: string;
  summary: string | null;
  content_text: string | null;
  url: string | null;
  source: string;
  tags: string[];
  key_takeaways: string[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail_url: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export const useContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContent = async () => {
    if (!user) {
      setContent([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent((data || []).map(item => ({
        ...item,
        processing_status: item.processing_status as 'pending' | 'processing' | 'completed' | 'failed'
      })));
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!user) {
      setCollections([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_items (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const collectionsWithCount = (data || []).map(collection => ({
        ...collection,
        item_count: collection.collection_items?.[0]?.count || 0
      }));
      
      setCollections(collectionsWithCount);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
    }
  };

  const addContent = async (url: string, notes?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Insert initial content record
      const { data: newContent, error: insertError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: 'Processing...',
          url,
          content_text: notes || null,
          source: 'web',
          processing_status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setContent(prev => [{
        ...newContent,
        processing_status: newContent.processing_status as 'pending' | 'processing' | 'completed' | 'failed'
      }, ...prev]);

      // Trigger AI processing
      try {
        const { error: processError } = await supabase.functions.invoke('process-content', {
          body: {
            url,
            userId: user.id,
            contentId: newContent.id
          }
        });

        if (processError) {
          console.error('Processing error:', processError);
          // Update status to failed
          await supabase
            .from('content')
            .update({ processing_status: 'failed' })
            .eq('id', newContent.id);
        }
      } catch (processError) {
        console.error('Failed to trigger processing:', processError);
      }

      // Refresh content to get updates
      setTimeout(() => fetchContent(), 1000);

      return newContent;
    } catch (error: any) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  const toggleFavorite = async (contentId: string) => {
    if (!user) return;

    try {
      const item = content.find(c => c.id === contentId);
      if (!item) return;

      const { error } = await supabase
        .from('content')
        .update({ is_favorite: !item.is_favorite })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setContent(prev =>
        prev.map(c =>
          c.id === contentId ? { ...c, is_favorite: !c.is_favorite } : c
        )
      );

      toast({
        title: item.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: item.title,
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error updating favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setContent(prev => prev.filter(c => c.id !== contentId));
      
      toast({
        title: "Content deleted",
        description: "The item has been removed from your library.",
      });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createCollection = async (name: string, description?: string, color?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          color: color || '#8b5cf6'
        })
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [{ ...data, item_count: 0 }, ...prev]);
      return data;
    } catch (error: any) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContent();
    fetchCollections();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const contentChannel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    const collectionsChannel = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCollections();
        }
      )
      .subscribe();

    const collectionItemsChannel = supabase
      .channel('collection-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collection_items'
        },
        () => {
          fetchCollections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(collectionsChannel);
      supabase.removeChannel(collectionItemsChannel);
    };
  }, [user]);

  const addToCollection = async (contentId: string, collectionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('collection_items')
        .insert({
          content_id: contentId,
          collection_id: collectionId
        });

      if (error) throw error;

      toast({
        title: "Added to collection",
        description: "Item has been added to your collection.",
      });
    } catch (error: any) {
      console.error('Error adding to collection:', error);
      throw error;
    }
  };

  return {
    content,
    collections,
    loading,
    addContent,
    toggleFavorite,
    deleteContent,
    createCollection,
    addToCollection,
    refetch: fetchContent,
  };
};