import { supabase } from '@/integrations/supabase/client';

export const rpcWithRetry = async <T>(
  fnName: any,
  params: any,
  maxRetries = 3
): Promise<{ data: T | null; error: any }> => {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await (supabase.rpc as any)(fnName, params);
    
    if (!error) return { data: data as T, error: null };
    
    if (error?.message?.includes('JWT') || error?.message?.includes('session')) {
      await supabase.auth.refreshSession();
      continue;
    }
    
    if (i === maxRetries - 1) return { data: null, error };
    
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  
  return { data: null, error: new Error('Max retries exceeded') };
};

export const withAuth = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return fn();
};
