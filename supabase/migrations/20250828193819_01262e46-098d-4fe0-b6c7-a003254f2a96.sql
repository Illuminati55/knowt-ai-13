-- Enable realtime for the content table
ALTER TABLE public.content REPLICA IDENTITY FULL;

-- Add content table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.content;

-- Enable realtime for the collections table  
ALTER TABLE public.collections REPLICA IDENTITY FULL;

-- Add collections table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;

-- Enable realtime for the collection_items table
ALTER TABLE public.collection_items REPLICA IDENTITY FULL;

-- Add collection_items table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_items;