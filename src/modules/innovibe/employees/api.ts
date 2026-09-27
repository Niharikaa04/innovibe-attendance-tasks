import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmployeeCreateInput, EmployeeCreateResult, Profile } from '../types';

/** Parses the safe error message out of an edge-function error response. */
async function functionErrorMessage(error: unknown): Promise<string> {
  const withContext = error as { context?: Response; message?: string } | null;

  if (withContext?.context) {
    try {
      const body = await withContext.context.clone().json();
      if (body?.error) return String(body.error);
    } catch {
      // response wasn't JSON — fall through to the generic message below
    }
  }

  return withContext?.message || 'Unable to create employee account.';
}

export const employeesApi = {
  /** Full employee directory. RLS already lets any signed-in person read
   *  profiles (same as the assignee/team pickers elsewhere in the app) — the
   *  Employees pages themselves are only reachable by authorized roles. */
  async directory(sb: SupabaseClient): Promise<Profile[]> {
    const { data, error } = await sb
      .from('profiles')
      .select('id, full_name, avatar_url, email, role, employee_id, status, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  /** Creates a new employee through the secure server-side edge function.
   *  Never touches auth.users or profiles directly from the browser. */
  async create(sb: SupabaseClient, input: EmployeeCreateInput): Promise<EmployeeCreateResult> {
    const { data, error } = await sb.functions.invoke('create-employee', {
      body: input,
    });

    if (error) {
      throw new Error(await functionErrorMessage(error));
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Unable to create employee account.');
    }

    return data.employee as EmployeeCreateResult;
  },
};
