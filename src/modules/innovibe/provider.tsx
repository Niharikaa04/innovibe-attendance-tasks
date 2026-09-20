import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import type { ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, Role } from './types';
import { MANAGER_ROLES } from './types';

// ---------------------------------------------------------------------------
// The module never creates its own Supabase client or auth session. The host
// app (InnoVibe Chat) passes in the client and the signed-in user it already
// has, so there is exactly one auth session and one realtime socket.
// ---------------------------------------------------------------------------

interface InnoVibeContextValue {
  supabase: SupabaseClient;
  userId: string | null;
  profile: Profile | null;
  role: Role;
  isManager: boolean;
  isAdmin: boolean;
  /** Every profile in the workspace — used for assignee pickers and name lookup. */
  people: Profile[];
  peopleById: Record<string, Profile>;
  refreshPeople: () => Promise<void>;
}

const InnoVibeContext = createContext<InnoVibeContextValue | null>(null);

export interface InnoVibeProviderProps {
  supabase: SupabaseClient;
  /** The signed-in user id from your existing auth context. */
  userId: string | null;
  /** Optional: pass your existing profile object to skip a fetch. */
  profile?: Profile | null;
  children: ReactNode;
}

export function InnoVibeProvider({
  supabase, userId, profile: profileProp, children,
}: InnoVibeProviderProps) {
  const [people, setPeople] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(profileProp ?? null);

  useEffect(() => { if (profileProp) setProfile(profileProp); }, [profileProp]);

  const loadPeople = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .order('full_name', { ascending: true });
    if (error) {
      console.error('[InnoVibe] could not load profiles:', error.message);
      return;
    }
    const rows = (data ?? []) as Profile[];
    setPeople(rows);
    if (!profileProp && userId) {
      setProfile(rows.find((p) => p.id === userId) ?? null);
    }
  }, [supabase, userId, profileProp]);

  useEffect(() => { if (userId) void loadPeople(); }, [userId, loadPeople]);

  const value = useMemo<InnoVibeContextValue>(() => {
    const role = (profile?.role ?? 'employee') as Role;
    return {
      supabase,
      userId,
      profile,
      role,
      isManager: MANAGER_ROLES.includes(role),
      isAdmin: role === 'ceo' || role === 'admin',
      people,
      peopleById: Object.fromEntries(people.map((p) => [p.id, p])),
      refreshPeople: loadPeople,
    };
  }, [supabase, userId, profile, people, loadPeople]);

  return <InnoVibeContext.Provider value={value}>{children}</InnoVibeContext.Provider>;
}

export function useInnoVibe(): InnoVibeContextValue {
  const ctx = useContext(InnoVibeContext);
  if (!ctx) {
    throw new Error('Wrap your app in <InnoVibeProvider> before using the attendance or task modules.');
  }
  return ctx;
}

/** Display name for any user id, falling back gracefully. */
export function useNameOf() {
  const { peopleById } = useInnoVibe();
  return (id?: string | null) =>
    (id && peopleById[id]?.full_name) || (id ? 'Unknown member' : 'Unassigned');
}
