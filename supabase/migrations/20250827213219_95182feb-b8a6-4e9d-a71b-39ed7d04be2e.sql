-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content table for saved items
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content_text TEXT,
  url TEXT,
  source TEXT NOT NULL CHECK (source IN ('web', 'document', 'youtube', 'linkedin')),
  tags TEXT[] DEFAULT '{}',
  key_takeaways TEXT[] DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  thumbnail_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection_items table for many-to-many relationship
CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, content_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for content
CREATE POLICY "Users can view their own content" 
ON public.content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content" 
ON public.content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" 
ON public.content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" 
ON public.content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for collections
CREATE POLICY "Users can view their own collections" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" 
ON public.collections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.collections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.collections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for collection_items
CREATE POLICY "Users can view their own collection items" 
ON public.collection_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.collections c 
  WHERE c.id = collection_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create their own collection items" 
ON public.collection_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.collections c 
  WHERE c.id = collection_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own collection items" 
ON public.collection_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.collections c 
  WHERE c.id = collection_id AND c.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_content_user_id ON public.content(user_id);
CREATE INDEX idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX idx_content_tags ON public.content USING GIN(tags);
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_content_id ON public.collection_items(content_id);