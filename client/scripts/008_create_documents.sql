-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  document_type TEXT CHECK (document_type IN ('contract', 'agreement', 'disclosure', 'inspection', 'appraisal', 'other')),
  related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
  related_to_id UUID,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies for documents
CREATE POLICY "Users can view documents they uploaded" 
  ON public.documents FOR SELECT 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete documents they uploaded" 
  ON public.documents FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Create indexes
CREATE INDEX idx_documents_related_to ON public.documents(related_to_type, related_to_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
