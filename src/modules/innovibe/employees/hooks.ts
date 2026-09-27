import { useCallback, useEffect, useState } from 'react';
import { useInnoVibe } from '../provider';
import { readableError } from '../lib/toast';
import { employeesApi } from './api';
import type { EmployeeCreateInput, EmployeeCreateResult, Profile } from '../types';

// ---------------------------------------------------------------------------
// useEmployeeDirectory — the full employee list for Employees → Employee Directory
// ---------------------------------------------------------------------------
export function useEmployeeDirectory() {
  const { supabase } = useInnoVibe();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmployees(await employeesApi.directory(supabase));
      setError(null);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  return { employees, loading, error, reload: load };
}

// ---------------------------------------------------------------------------
// useCreateEmployee — Employees → Add Employee
// ---------------------------------------------------------------------------
export function useCreateEmployee() {
  const { supabase, refreshPeople } = useInnoVibe();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (input: EmployeeCreateInput): Promise<EmployeeCreateResult> => {
    setBusy(true);
    setError(null);
    try {
      const result = await employeesApi.create(supabase, input);
      // The new hire should show up in assignee pickers etc. right away.
      void refreshPeople();
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : readableError(e);
      setError(message);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, create, clearError: () => setError(null) };
}
