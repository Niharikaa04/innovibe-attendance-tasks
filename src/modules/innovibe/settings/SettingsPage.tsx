import { useEffect, useState } from 'react';
import { useInnoVibe } from '../provider';
import { attendanceApi } from '../attendance/api';
import { Avatar, Button, Card, Field, SectionHead } from '../ui/ui';
import type { WorkSettings } from '../types';

export function SettingsPage({ onSignOut }: { onSignOut: () => void }) {
  const { supabase, profile, isAdmin } = useInnoVibe();
  const [settings, setSettings] = useState<WorkSettings | null>(null);

  useEffect(() => {
    let alive = true;
    attendanceApi.settings(supabase).then((s) => { if (alive) setSettings(s); }).catch(() => {});
    return () => { alive = false; };
  }, [supabase]);

  return (
    <div className="iv-page">
      <div className="iv-page__head">
        <div>
          <h1 className="iv-page__title">Settings</h1>
          <p className="iv-page__sub">Your account and, for admins, office-wide preferences.</p>
        </div>
      </div>

      <Card>
        <SectionHead title="Your profile" />
        <div className="iv-settings-profile">
          <Avatar name={profile?.full_name} url={profile?.avatar_url} size={56} />
          <div>
            <div className="iv-settings-profile__name">{profile?.full_name ?? 'Unnamed'}</div>
            <div className="iv-settings-profile__role">{profile?.role ?? 'employee'}</div>
          </div>
        </div>
        <p className="iv-field__hint">
          Name and photo are managed through the InnoVibe Chat profile settings — this module
          reuses that same profile record rather than keeping its own copy.
        </p>
      </Card>

      {isAdmin && (
        <Card>
          <SectionHead
            title="Office hours"
            subtitle="Used for lateness detection and the attendance percentage calculation."
          />
          {settings ? (
            <div className="iv-formgrid">
              <Field label="Timezone"><input className="iv-input" value={settings.timezone} disabled /></Field>
              <Field label="Work start"><input className="iv-input" value={settings.work_start} disabled /></Field>
              <Field label="Work end"><input className="iv-input" value={settings.work_end} disabled /></Field>
              <Field label="Late grace (minutes)">
                <input className="iv-input" value={settings.late_grace_minutes} disabled />
              </Field>
            </div>
          ) : (
            <p className="iv-field__hint">Loading…</p>
          )}
          <p className="iv-field__hint">
            Editing these requires SQL access (see docs/SETUP_GUIDE.md) — this panel is read-only
            for now to avoid a second, untested write path into the settings table.
          </p>
        </Card>
      )}

      <Card>
        <SectionHead title="Session" />
        <Button variant="danger" onClick={onSignOut}>Sign out</Button>
      </Card>
    </div>
  );
}
