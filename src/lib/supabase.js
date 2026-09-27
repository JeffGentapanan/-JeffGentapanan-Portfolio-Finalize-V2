import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// This ID controls the interface. Supabase RLS independently protects the data.
export const OWNER_ID = '9f3911bb-eaa1-4a39-b269-861c499a3b13';
export const supabase = url && key ? createClient(url, key) : null;

export function requireSupabase() {
  if (!supabase)
    throw new Error(
      'Supabase connection settings are missing. Check the deployment environment variables.'
    );
  return supabase;
}
