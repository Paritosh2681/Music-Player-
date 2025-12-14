import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase Environment Variables are missing. Please check your .env file or Vercel deployment settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);