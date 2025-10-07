-- Create deals/transactions table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN ('purchase', 'sale', 'lease', 'rental')),
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'contract', 'closing', 'closed_won', 'closed_lost')),
  value DECIMAL(12, 2),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies for deals
CREATE POLICY "Users can view deals assigned to them or created by them" 
  ON public.deals FOR SELECT 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can insert deals" 
  ON public.deals FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update deals assigned to them or created by them" 
  ON public.deals FOR UPDATE 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete deals they created" 
  ON public.deals FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_assigned_to ON public.deals(assigned_to);
CREATE INDEX idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX idx_deals_created_at ON public.deals(created_at DESC);
