import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser configuradas no Vercel
// e devem começar com VITE_ para serem acessíveis no frontend (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
