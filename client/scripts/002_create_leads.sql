-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'cold_call', 'event', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads
CREATE POLICY "Users can view leads assigned to them or created by them" 
  ON public.leads FOR SELECT 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can insert leads" 
  ON public.leads FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update leads assigned to them or created by them" 
  ON public.leads FOR UPDATE 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete leads they created" 
  ON public.leads FOR DELETE 
  USING (auth.uid() = created_by);

-- Create index for performance
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
