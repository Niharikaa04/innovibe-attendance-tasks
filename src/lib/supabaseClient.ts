// ---------------------------------------------------------------------------
// REFERENCE ONLY.
//
// If your InnoVibe project already has a Supabase client (search your repo
// for "createClient" or "@supabase/supabase-js" — chat, auth and DMs cannot
// work without one), use that file and delete this one. Creating a second
// client means a second auth session and a second realtime socket, which
// causes exactly the kind of intermittent bugs that are painful to trace.
//
// Only copy this in if that search comes back empty.
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      // Keep this reasonable — too high and a busy day of check-ins/comments
      // can overwhelm a slow client; too low and updates feel laggy.
      eventsPerSecond: 10,
    },
  },
});
