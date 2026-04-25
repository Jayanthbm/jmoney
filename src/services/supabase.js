// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmhdqtwquiznsplclwse.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaGRxdHdxdWl6bnNwbGNsd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTk0MzYsImV4cCI6MjA1OTE3NTQzNn0.ypGAundMU_FojEJ-Rc68wYI-XAi_KgVDVWA2DBeDp6c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
