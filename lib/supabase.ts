import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gjvomqofutsmqocdmqx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqdm9tcW9mdW90c21xb2NkbXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NTIyOTQsImV4cCI6MjEwMjQyODI5NH0.0VQn3B9GClocDMM4uIgA3qVRNZIMEm5cCxAsuoE6Si0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined, falling back to anon key client.');
    return supabase;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
