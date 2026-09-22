import { useEffect, useRef, useState } from 'react';
import { useInnoVibe } from '../provider';
import { attendanceApi } from '../attendance/api';
import { readableError, useToast } from '../lib/toast';
import {
  Avatar, Button, Card, Field, SectionHead,
} from '../ui/ui';
import type { WorkSettings } from '../types';

// Change this to an existing bucket name if InnoVibe Chat already has one for
// profile photos (Supabase -> Storage). Otherwise migration 0012 creates it.
const AVATAR_BUCKET = 'avatars';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB, matches migration 0012
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function SettingsPage({ onSignOut }: { onSignOut: () => void }) {
  const { supabase, profile, userId, isAdmin, refreshPeople } = useInnoVibe();
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

      <ProfileCard
        supabase={supabase}
        profile={profile}
        userId={userId}
        refreshPeople={refreshPeople}
      />

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

// ---------------------------------------------------------------------------
// Your profile — edit name, change photo
// ---------------------------------------------------------------------------
function ProfileCard({
  supabase, profile, userId, refreshPeople,
}: {
  supabase: ReturnType<typeof useInnoVibe>['supabase'];
  profile: ReturnType<typeof useInnoVibe>['profile'];
  userId: string | null;
  refreshPeople: () => Promise<void>;
}) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Keep the field in step if the profile loads or changes after mount.
  useEffect(() => {
    setName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  // Release the temporary local preview URL when it is replaced or the
  // component unmounts, so the browser does not hold onto the image forever.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const nameChanged = name.trim() !== (profile?.full_name ?? '').trim();

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setNameError('Enter your name.');
      return;
    }
    if (trimmed.length > 100) {
      setNameError('Please keep the name under 100 characters.');
      return;
    }
    if (!userId) return;

    setSavingName(true);
    setNameError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', userId);
      if (error) throw error;
      await refreshPeople();
      toast.success('Name updated');
    } catch (e) {
      setNameError(readableError(e));
    } finally {
      setSavingName(false);
    }
  };

  const pickPhoto = () => fileInput.current?.click();

  const onPhotoChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again later if needed
    if (!file || !userId) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('That photo is too large. Please choose one under 2 MB.');
      return;
    }

    setPhotoError(null);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // A fresh path each time, so browsers never show a stale cached photo.
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: pub.publicUrl })
        .eq('id', userId);
      if (profileError) throw profileError;

      await refreshPeople();
      toast.success('Photo updated');
    } catch (err) {
      setPhotoError(readableError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <SectionHead title="Your profile" />

      <div className="iv-settings-profile">
        <Avatar name={profile?.full_name} url={previewUrl ?? profile?.avatar_url} size={56} />

        <div>
          <div className="iv-settings-profile__name">{profile?.full_name ?? 'Unnamed'}</div>
          <div className="iv-settings-profile__role">{profile?.role ?? 'employee'}</div>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPhotoChosen}
          style={{ display: 'none' }}
        />

        <Button size="sm" loading={uploading} disabled={uploading} onClick={pickPhoto}>
          {uploading ? 'Uploading…' : 'Change photo'}
        </Button>
      </div>

      {photoError && <p className="iv-field__error">{photoError}</p>}

      <p className="iv-field__hint">JPEG, PNG or WebP, up to 2 MB.</p>

      <Field label="Full name" error={nameError ?? undefined}>
        <div className="iv-formgrid" style={{ alignItems: 'end' }}>
          <input
            className="iv-input"
            value={name}
            maxLength={100}
            onChange={(e) => { setName(e.target.value); setNameError(null); }}
            placeholder="Your name"
          />

          <Button
            variant="primary"
            size="sm"
            loading={savingName}
            disabled={savingName || !nameChanged}
            onClick={saveName}
          >
            Save name
          </Button>
        </div>
      </Field>
    </Card>
  );
}