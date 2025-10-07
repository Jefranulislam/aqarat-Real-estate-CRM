-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'showing', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
  related_to_id UUID,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can insert tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tasks assigned to them or created by them" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete tasks they created" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
