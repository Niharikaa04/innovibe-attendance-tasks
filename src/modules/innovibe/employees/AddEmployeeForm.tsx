import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Field, SectionHead } from '../ui/ui';
import { useCreateEmployee } from './hooks';
import { CREATABLE_ROLES } from '../types';
import type { EmployeeCreateResult, Role } from '../types';

const ROLE_LABEL: Record<Role, string> = {
  ceo: 'CEO',
  admin: 'Admin',
  manager: 'Manager',
  hr: 'HR',
  lead: 'Lead',
  employee: 'Employee',
  intern: 'Intern',
};

const EMPTY_FORM = {
  full_name: '',
  employee_id: '',
  email: '',
  role: 'employee' as Role,
  password: '',
};

/** Reasonably strong random password: upper, lower, digit, symbol, 12 chars. */
function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = upper + lower + digits + symbols;

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < 12) chars.push(pick(all));

  // Shuffle so the guaranteed characters aren't always in the same position.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function AddEmployeeForm({
  onViewDirectory,
}: { onViewDirectory?: () => void }) {
  const { busy, error, create, clearError } = useCreateEmployee();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<EmployeeCreateResult | null>(null);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((fe) => ({ ...fe, [key]: '' }));
    clearError();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!form.employee_id.trim()) errs.employee_id = 'User ID is required.';
    else if (!/^[A-Za-z0-9._-]{2,40}$/.test(form.employee_id.trim())) {
      errs.employee_id = 'Use 2–40 letters, numbers, dot, dash, or underscore.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'Password must contain at least 8 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!validate()) return;

    try {
      const result = await create({
        full_name: form.full_name.trim(),
        employee_id: form.employee_id.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        password: form.password,
      });
      setSuccess(result);
      setForm(EMPTY_FORM);
      setShowPassword(false);
    } catch {
      // error is already surfaced via useCreateEmployee's `error` state
    }
  };

  const cancel = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    clearError();
  };

  return (
    <div className="iv-page iv-stack">
      {success && (
        <Card className="iv-notice-inline" pad>
          <strong>Employee created successfully.</strong>
          <p style={{ margin: '8px 0 0' }}>
            {success.full_name} · User ID <strong>{success.employee_id}</strong> ·{' '}
            {ROLE_LABEL[success.role]} · {success.email}
          </p>
          <p style={{ margin: '6px 0 0' }}>
            They can now sign in with their User ID and the temporary password you set.
          </p>
          {onViewDirectory && (
            <div style={{ marginTop: 12 }}>
              <Button size="sm" onClick={onViewDirectory}>View Employee Directory</Button>
            </div>
          )}
        </Card>
      )}

      <Card>
        <SectionHead title="Add Employee" subtitle="Creates a real login for InnoVibe — they can sign in right away." />

        {error && <div className="iv-error"><p>{error}</p></div>}

        <form onSubmit={submit}>
          <div className="iv-formgrid">
            <Field label="Full Name" error={fieldErrors.full_name}>
              <input
                className="iv-input"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Jane Doe"
                autoComplete="off"
              />
            </Field>

            <Field label="User ID / Employee ID" error={fieldErrors.employee_id} hint="What they'll type to sign in.">
              <input
                className="iv-input"
                value={form.employee_id}
                onChange={(e) => set('employee_id', e.target.value)}
                placeholder="Jane.hr"
                autoComplete="off"
              />
            </Field>

            <Field label="Real Email" error={fieldErrors.email}>
              <input
                className="iv-input"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@innovibemobility.com"
                autoComplete="off"
              />
            </Field>

            <Field label="Role">
              <select
                className="iv-input"
                value={form.role}
                onChange={(e) => set('role', e.target.value as Role)}
              >
                {CREATABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </Field>

            <Field label="Temporary Password" error={fieldErrors.password} hint="At least 8 characters.">
              <div className="iv-passwordfield">
                <input
                  className="iv-input"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="iv-passwordfield__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </Field>

            <Field label=" ">
              <Button type="button" onClick={() => { set('password', generatePassword()); setShowPassword(true); }}>
                Generate Password
              </Button>
            </Field>
          </div>

          <div className="iv-modal__foot" style={{ marginTop: 16, paddingTop: 16 }}>
            <Button type="button" onClick={cancel}>Cancel</Button>
            <Button type="submit" variant="primary" loading={busy}>Create Employee</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
