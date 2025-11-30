import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface OperationRecord {
  id: string;
  actor_user_id: string | null;
  target_user_id: string | null;
  action: string;
  metadata: any;
  created_at: string;
}

export function useOperations() {
  const { role, user } = useAuth();
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, [role, user]);

  async function fetchOperations() {
    setLoading(true);
    // Managers see all operations, users see their own (as actor)
    let query = supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (role !== 'manager' && user) {
      query = supabase.from('operations').select('*').eq('actor_user_id', user.id).order('created_at', { ascending: false }).limit(100);
    }

    const { data, error } = await query;
    if (!error && data) {
      setOperations(data as OperationRecord[]);
    }
    setLoading(false);
  }

  return { operations, loading, refetch: fetchOperations };
}
