-- Create contacts table (converted leads or direct contacts)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  contact_type TEXT CHECK (contact_type IN ('buyer', 'seller', 'both', 'investor', 'other')),
  tags TEXT[],
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies for contacts
CREATE POLICY "Users can view contacts assigned to them or created by them" 
  ON public.contacts FOR SELECT 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can insert contacts" 
  ON public.contacts FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update contacts assigned to them or created by them" 
  ON public.contacts FOR UPDATE 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete contacts they created" 
  ON public.contacts FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_contacts_assigned_to ON public.contacts(assigned_to);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
