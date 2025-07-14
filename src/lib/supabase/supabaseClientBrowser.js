import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

if (typeof window !== 'undefined') {
  // Browser environment
  if (!globalThis.supabase) {
    globalThis.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  supabase = globalThis.supabase;
} else {
  // Server environment (should ideally use supabaseClientServer.js for SSR)
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase};

export const getSupabaseClient = () => {
  return supabase;
};
