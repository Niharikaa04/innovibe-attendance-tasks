import { useMemo, useState } from 'react';
import {
  Avatar, Badge, Button, Card, EmptyState, ErrorState, SectionHead, Search, SkeletonRows,
} from '../ui/ui';
import { IvIcon } from '../ui/icons';
import { useEmployeeDirectory } from './hooks';
import { CREATABLE_ROLES } from '../types';
import type { AccountStatus, Role } from '../types';

const ROLE_LABEL: Record<Role, string> = {
  ceo: 'CEO',
  admin: 'Admin',
  manager: 'Manager',
  hr: 'HR',
  lead: 'Lead',
  employee: 'Employee',
  intern: 'Intern',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function EmployeeDirectoryPage({
  onAddEmployee,
}: { onAddEmployee?: () => void }) {
  const { employees, loading, error, reload } = useEmployeeDirectory();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (roleFilter !== 'all' && e.role !== roleFilter) return false;
      if (statusFilter !== 'all' && (e.status ?? 'active') !== statusFilter) return false;
      if (q) {
        const haystack = `${e.full_name ?? ''} ${e.employee_id ?? ''} ${e.email ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [employees, query, roleFilter, statusFilter]);

  return (
    <div className="iv-page iv-stack">
      <Card>
        <SectionHead
          title="Employee Directory"
          subtitle={`${employees.length} employee${employees.length === 1 ? '' : 's'} in InnoVibe`}
          actions={onAddEmployee && (
            <Button variant="primary" onClick={onAddEmployee}>
              <IvIcon name="plus-circle" size={16} /> Add Employee
            </Button>
          )}
        />

        {error && <ErrorState message={error} onRetry={reload} />}

        <div className="iv-filters">
          <Search value={query} onChange={setQuery} placeholder="Search by name, User ID, or email" />

          <select
            className="iv-input iv-input--compact"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            {(['ceo', 'admin', ...CREATABLE_ROLES] as Role[])
              .filter((r, i, arr) => arr.indexOf(r) === i)
              .map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>

          <select
            className="iv-input iv-input--compact"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
            aria-label="Filter by account status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {loading ? <SkeletonRows rows={6} /> : visible.length === 0 ? (
          <EmptyState
            title="No employees match this view"
            body="Clear the search or filters, or add a new employee."
            action={(
              <Button size="sm" onClick={() => { setQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}>
                Reset filters
              </Button>
            )}
          />
        ) : (
          <div className="iv-tablewrap">
            <table className="iv-table iv-table--people">
              <thead>
                <tr>
                  <th>Employee</th><th>User ID</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr key={e.id} className="iv-row">
                    <td data-label="Employee">
                      <span className="iv-person">
                        <Avatar name={e.full_name} url={e.avatar_url} />
                        <span><strong>{e.full_name ?? 'Unnamed'}</strong></span>
                      </span>
                    </td>
                    <td data-label="User ID">{e.employee_id ?? '—'}</td>
                    <td data-label="Email">{e.email ?? '—'}</td>
                    <td data-label="Role"><Badge tone="s-in_progress">{ROLE_LABEL[e.role]}</Badge></td>
                    <td data-label="Status">
                      <Badge tone={(e.status ?? 'active') === 'active' ? 'working' : 'absent'} dot>
                        {(e.status ?? 'active') === 'active' ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td data-label="Created">{formatDate(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
