import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfvrrhqsqofcflrvxlmk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnJyaHFzcW9mY2ZscnZ4bG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDgwNjksImV4cCI6MjEwMTQ4NDA2OX0.ne3ZkXMYiG-eeFUf3681akAk85O3J9wT3apjpugepXg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
