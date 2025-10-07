-- Create activities/communication log table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'sms', 'meeting', 'note', 'showing', 'other')),
  subject TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
  related_to_id UUID,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policies for activities
CREATE POLICY "Users can view activities they created" 
  ON public.activities FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert activities" 
  ON public.activities FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update activities they created" 
  ON public.activities FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete activities they created" 
  ON public.activities FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_activities_related_to ON public.activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
