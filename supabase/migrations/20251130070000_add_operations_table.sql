-- Create operations (audit) table to record actions performed by users/managers
CREATE TABLE public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Managers can view all operations
CREATE POLICY "Managers can view all operations" ON public.operations
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- Users can view their own operations
CREATE POLICY "Users can view own operations" ON public.operations
  FOR SELECT USING (auth.uid() = actor_user_id);

-- Allow users to insert their own operations
CREATE POLICY "Users can insert own operations" ON public.operations
  FOR INSERT WITH CHECK (auth.uid() = actor_user_id);
