// Shared CORS headers for InnoVibe edge functions. The InnoVibe frontend is a
// single-page app that calls these functions with the user's own Supabase
// session (never a service-role key), so a permissive origin is fine here —
// every privileged check happens inside the function, not at the CORS layer.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
