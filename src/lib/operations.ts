import { supabase } from '@/integrations/supabase/client';

export async function logOperation(actor_user_id: string | null, target_user_id: string | null, action: string, metadata: any = {}) {
  try {
    await supabase.from('operations').insert({
      actor_user_id,
      target_user_id,
      action,
      metadata,
    });
  } catch (e) {
    // Do not block the main flow if logging fails
    // console.error('Failed to log operation', e);
  }
}
