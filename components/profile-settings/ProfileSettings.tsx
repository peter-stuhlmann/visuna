'use client';

import { FC, useEffect, useMemo, useRef, useState, useCallback } from 'react';

import {
  Actions,
  HeaderRow,
  SaveButton,
} from '@/components/seo-settings/SeoSettingsSummary.styles';
import TextInputBlock from '@/components/blocks/TextInputBlock';
import { getAvatarUrl } from '@/utils/getAvatarUrl';
import DateRangePicker from '@/components/content-elements/default/core/inputs/date-range-picker/DateRangePicker';
import WorkspaceCard from '@/components/workspaces/WorkspaceCard';
import { Grid } from '@/components/content-elements/default';
import { Role } from '@/components/content-elements/default/types';
import type { WorkspaceListItem } from '@/lib/workspaces/workspaces.types';

type ProfileSettingsProps = {
  initialProfile?: Partial<ProfileData>;
  initialWorkspaceProfile?: Partial<WorkspaceProfileData>;
  onSaved?: (profile: ProfileData) => void;
  onWorkspaceSaved?: (workspaceProfile: WorkspaceProfileData) => void;
  workspaces?: WorkspaceListItem[];
  userId?: string;
  currentWorkspaceId?: string;
};

export type ProfileData = {
  name: string;
  email: string;
  avatarUrl: string;
  birthday: string;
  slogan: string;
};

export type WorkspaceProfileData = {
  displayName: string;
  avatarUrl: string;
  role: string;
};

const emptyProfile = (): ProfileData => ({
  name: '',
  email: '',
  avatarUrl: '',
  birthday: '',
  slogan: '',
});

const emptyWorkspaceProfile = (): WorkspaceProfileData => ({
  displayName: '',
  avatarUrl: '',
  role: '',
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function coerceProfile(input: unknown): ProfileData {
  const base = emptyProfile();
  if (!isRecord(input)) return base;

  return {
    name: coerceString(input.name),
    email: coerceString(input.email),
    avatarUrl: coerceString(input.avatarUrl),
    birthday: coerceString(input.birthday),
    slogan: coerceString(input.slogan),
  };
}

function coerceWorkspaceProfile(input: unknown): WorkspaceProfileData {
  const base = emptyWorkspaceProfile();
  if (!isRecord(input)) return base;

  return {
    displayName: coerceString(input.displayName),
    avatarUrl: coerceString(input.avatarUrl),
    role: coerceString(input.role),
  };
}

type GetProfileResponse = {
  profile?: unknown;
  workspaceProfile?: unknown;
  error?: string;
};

type SaveProfileResponse = {
  profile?: unknown;
  workspaceProfile?: unknown;
  error?: string;
};

async function fetchProfile(): Promise<{
  profile: ProfileData | null;
  workspaceProfile: WorkspaceProfileData | null;
}> {
  const res = await fetch('/api/profile', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('fetchProfile failed:', res.status, txt);
    return { profile: null, workspaceProfile: null };
  }

  const data = (await res.json()) as GetProfileResponse;

  return {
    profile: coerceProfile(data?.profile ?? {}),
    workspaceProfile: coerceWorkspaceProfile(data?.workspaceProfile ?? {}),
  };
}

async function saveProfile(params: {
  profile: ProfileData;
  workspaceProfile: WorkspaceProfileData;
}): Promise<{
  profile: ProfileData | null;
  workspaceProfile: WorkspaceProfileData | null;
}> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: params.profile,
      workspaceProfile: params.workspaceProfile,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('saveProfile failed:', res.status, txt);
    return { profile: null, workspaceProfile: null };
  }

  const data = (await res.json()) as SaveProfileResponse;

  return {
    profile: data?.profile ? coerceProfile(data.profile) : null,
    workspaceProfile: data?.workspaceProfile
      ? coerceWorkspaceProfile(data.workspaceProfile)
      : null,
  };
}

function getInitials(nameOrEmail: string): string {
  const s = (nameOrEmail || '').trim();
  if (!s) return '👤';
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  const out = (a + b).toUpperCase();
  return out || '👤';
}

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

function formatBirthday(isoDate: string): string {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

// Shared avatar circle component
function AvatarCircle({
  src,
  initials,
  size,
  isEditing,
  isUploading,
  onClick,
  onUploadOverlayEnter,
  onUploadOverlayLeave,
}: {
  src: string;
  initials: string;
  size: number;
  isEditing: boolean;
  isUploading: boolean;
  onClick?: () => void;
  onUploadOverlayEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onUploadOverlayLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 128 ? 22 : 16,
        fontWeight: 700,
        color: '#374151',
        flexShrink: 0,
        position: 'relative',
        cursor: isEditing ? 'pointer' : 'default',
      }}
      aria-label="Profilbild"
      title={isEditing ? 'Profilbild ändern' : 'Profilbild'}
      onClick={onClick}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Profilbild"
          fetchPriority="high"
          loading="eager"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        initials
      )}

      {isEditing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isUploading ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isUploading ? 1 : 0,
            transition: 'opacity 0.2s',
            borderRadius: '50%',
          }}
          onMouseEnter={onUploadOverlayEnter ?? ((e) => {
            if (!isUploading) e.currentTarget.style.opacity = '1';
          })}
          onMouseLeave={onUploadOverlayLeave ?? ((e) => {
            if (!isUploading) e.currentTarget.style.opacity = '0';
          })}
        >
          {isUploading ? (
            <div
              style={{
                width: size > 128 ? 24 : 18,
                height: size > 128 ? 24 : 18,
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <CameraIcon />
          )}
        </div>
      )}
    </div>
  );
}

const ProfileSettings: FC<ProfileSettingsProps> = ({
  initialProfile,
  initialWorkspaceProfile,
  onSaved,
  onWorkspaceSaved,
  workspaces = [],
  userId = '',
  currentWorkspaceId = '',
}) => {
  // ---------------------------
  // Initial
  // ---------------------------
  const initial = useMemo(
    () => coerceProfile(initialProfile ?? {}),
    [initialProfile]
  );
  const initialWs = useMemo(
    () => coerceWorkspaceProfile(initialWorkspaceProfile ?? {}),
    [initialWorkspaceProfile]
  );

  const [profile, setProfile] = useState<ProfileData>(initial);
  const [workspaceProfile, setWorkspaceProfile] =
    useState<WorkspaceProfileData>(initialWs);

  const [dirty, setDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingWsAvatar, setIsUploadingWsAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Hidden file input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsFileInputRef = useRef<HTMLInputElement>(null);

  // Snapshot (für Abbrechen)
  const snapshotRef = useRef<{
    profile: ProfileData;
    workspaceProfile: WorkspaceProfileData;
  } | null>(null);

  // initial props sync
  useEffect(() => {
    setProfile(initial);
    setDirty(false);
    setIsEditing(false);
    snapshotRef.current = null;
  }, [initial]);

  useEffect(() => {
    setWorkspaceProfile(initialWs);
    setDirty(false);
    setIsEditing(false);
    snapshotRef.current = null;
  }, [initialWs]);

  // Wenn initial leer ist -> nachladen
  useEffect(() => {
    let cancelled = false;

    const hasInitial =
      Boolean(initial.name) ||
      Boolean(initial.email) ||
      Boolean(initial.avatarUrl) ||
      Boolean(initialWs.displayName) ||
      Boolean(initialWs.avatarUrl) ||
      Boolean(initialWs.role);

    if (hasInitial) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const loaded = await fetchProfile();
        if (cancelled) return;

        if (loaded.profile) setProfile(loaded.profile);
        if (loaded.workspaceProfile)
          setWorkspaceProfile(loaded.workspaceProfile);

        setDirty(false);
        setIsEditing(false);
        snapshotRef.current = null;
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initial, initialWs]);

  const setProfileField = <K extends keyof ProfileData>(
    key: K,
    next: string
  ) => {
    setProfile((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  };

  const setWorkspaceField = <K extends keyof WorkspaceProfileData>(
    key: K,
    next: string
  ) => {
    setWorkspaceProfile((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  };

  const enterEditMode = () => {
    snapshotRef.current = {
      profile: { ...profile },
      workspaceProfile: { ...workspaceProfile },
    };
    setIsEditing(true);
    setDirty(false);
  };

  const handleCancel = () => {
    const snap = snapshotRef.current;
    if (snap) {
      setProfile(snap.profile);
      setWorkspaceProfile(snap.workspaceProfile);
    }
    setIsEditing(false);
    setDirty(false);
    snapshotRef.current = null;
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const saved = await saveProfile({ profile, workspaceProfile });

      if (saved.profile) {
        setProfile(saved.profile);
        onSaved?.(saved.profile);
      } else {
        onSaved?.(profile);
      }

      if (saved.workspaceProfile) {
        setWorkspaceProfile(saved.workspaceProfile);
        onWorkspaceSaved?.(saved.workspaceProfile);
      } else {
        onWorkspaceSaved?.(workspaceProfile);
      }

      setDirty(false);
      setIsEditing(false);
      snapshotRef.current = null;
      setLastSavedAt(Date.now());
    } finally {
      setIsSaving(false);
    }
  };

  // Resize image on client before upload (max 512x512)
  const resizeImage = useCallback((file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 512;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Blob failed'))),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const showAvatarError = useCallback((msg: string) => {
    setAvatarError(msg);
    setTimeout(() => setAvatarError(null), 5000);
  }, []);

  const handleAvatarUpload = useCallback(async (file: File, target: 'profile' | 'workspace') => {
    const setUploading = target === 'profile' ? setIsUploadingAvatar : setIsUploadingWsAvatar;
    setUploading(true);
    setAvatarError(null);
    try {
      const resized = await resizeImage(file);
      const formData = new FormData();
      formData.append('file', new File([resized], 'avatar.jpg', { type: 'image/jpeg' }));

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showAvatarError((data as Record<string, string>).error || 'Upload fehlgeschlagen');
        return;
      }

      const data = (await res.json()) as { avatarUrl: string };
      if (target === 'profile') {
        setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      } else {
        setWorkspaceProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      }
      setDirty(true);
    } catch (err) {
      console.error('Avatar upload error:', err);
      showAvatarError('Upload fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setUploading(false);
    }
  }, [resizeImage, showAvatarError]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'workspace') => {
      const file = e.target.files?.[0];
      if (file) void handleAvatarUpload(file, target);
      e.target.value = '';
    },
    [handleAvatarUpload]
  );

  const rawAvatarUrl =
    profile.avatarUrl?.trim() || workspaceProfile.avatarUrl?.trim() || '';
  const avatarSrc = getAvatarUrl(rawAvatarUrl, 'l');
  const initials = getInitials(profile.name || profile.email);

  // Workspace avatar: fallback to main profile avatar
  const rawWsAvatarUrl = workspaceProfile.avatarUrl?.trim() || '';
  const wsAvatarSrc = rawWsAvatarUrl
    ? getAvatarUrl(rawWsAvatarUrl, 'l')
    : avatarSrc;

  // Workspace displayName: fallback to real name
  const effectiveWsDisplayName = workspaceProfile.displayName || profile.name || '';

  // Find current workspace for role display
  const currentWs = workspaces.find((ws) => ws._id === currentWorkspaceId);
  const currentRole = currentWs?.access?.find((a) => a.userId === userId)?.role || workspaceProfile.role || '';

  return (
    <>
      {/* Keyframe for spinner animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <HeaderRow>
        <div>
          {lastSavedAt ? (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Zuletzt gespeichert:{' '}
              {new Intl.DateTimeFormat('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(new Date(lastSavedAt))}
            </div>
          ) : null}
        </div>

        <Actions style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isEditing ? (
            <SaveButton
              type="button"
              onClick={enterEditMode}
              disabled={isLoading || isSaving}
              $dirty={false}
              title="Bearbeiten"
            >
              Bearbeiten
            </SaveButton>
          ) : (
            <>
              <SaveButton
                type="button"
                onClick={handleCancel}
                disabled={isLoading || isSaving}
                $dirty={false}
                title="Änderungen verwerfen"
              >
                Abbrechen
              </SaveButton>

              <SaveButton
                type="button"
                onClick={handleSave}
                disabled={isLoading || isSaving || !dirty}
                $dirty={dirty}
                title={dirty ? 'Änderungen speichern' : 'Keine Änderungen'}
              >
                {isSaving ? 'Speichere…' : 'Speichern'}
              </SaveButton>
            </>
          )}
        </Actions>
      </HeaderRow>

      {isLoading ? (
        <div style={{ fontSize: 12, color: '#6b7280', padding: '6px 0' }}>
          Profil wird geladen…
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {/* ──────────────────────────────────────────────────────── */}
          {/* Avatar + Name/Email/Birthday/Slogan row                */}
          {/* ──────────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              marginBottom: 24,
            }}
          >
            <AvatarCircle
              src={avatarSrc}
              initials={initials}
              size={256}
              isEditing={isEditing}
              isUploading={isUploadingAvatar}
              onClick={() => {
                if (isEditing && !isUploadingAvatar) {
                  fileInputRef.current?.click();
                }
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'profile')}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {/* Name */}
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfileField('name', e.target.value)}
                  placeholder="Name eingeben"
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#111827',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '4px 10px',
                    outline: 'none',
                    background: '#fff',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>
                  {profile.name || '—'}
                </div>
              )}

              {/* Email (read-only) */}
              <div style={{ fontSize: '1rem', color: '#6b7280' }}>
                {profile.email || '—'}
              </div>

              {/* Birthday */}
              {isEditing ? (
                <DateRangePicker
                  value={{
                    start: profile.birthday ? new Date(profile.birthday + 'T00:00:00') : null,
                    end: profile.birthday ? new Date(profile.birthday + 'T00:00:00') : null,
                  }}
                  onChange={(range) => {
                    if (range.start) {
                      const d = range.start;
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      setProfileField('birthday', `${yyyy}-${mm}-${dd}`);
                    }
                  }}
                  singleDate
                  hidePresets
                  placeholder="Geburtsdatum wählen"
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.875rem', color: '#9ca3af', minWidth: 100 }}>
                    Geburtsdatum:
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {formatBirthday(profile.birthday)}
                  </span>
                </div>
              )}

              {/* Slogan */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af', minWidth: 100 }}>
                  Slogan:
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.slogan}
                    onChange={(e) => setProfileField('slogan', e.target.value)}
                    placeholder="Dein Slogan"
                    style={{
                      fontSize: '0.875rem',
                      color: '#111827',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      padding: '4px 10px',
                      outline: 'none',
                      background: '#fff',
                      flex: 1,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#374151', fontStyle: profile.slogan ? 'italic' : 'normal' }}>
                    {profile.slogan || '—'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar upload error */}
          {avatarError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                marginBottom: 12,
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 13,
              }}
            >
              <span style={{ flex: 1 }}>{avatarError}</span>
              <button
                type="button"
                onClick={() => setAvatarError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b91c1c',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* Meine Workspaces                                       */}
          {/* ──────────────────────────────────────────────────────── */}
          <div style={{ marginTop: 32 }}>
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: '1.1rem' }}>
              Meine Workspaces
            </div>

            {workspaces.length > 0 ? (
              <Grid>
                {workspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws._id}
                    workspace={ws}
                    role={
                      ws.access
                        ?.find((entry) => entry.userId === userId)
                        ?.role.toLowerCase() as Role
                    }
                  />
                ))}
              </Grid>
            ) : (
              <div style={{ color: '#9ca3af', fontSize: 14 }}>
                Keine Workspaces gefunden.
              </div>
            )}

            {/* Per-workspace settings for current workspace */}
            {currentWs && (
              <div
                style={{
                  marginTop: 24,
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  background: '#fafafa',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 16 }}>
                  Einstellungen für „{currentWs.name}"
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
                  {/* Workspace avatar (128x128) */}
                  <AvatarCircle
                    src={wsAvatarSrc}
                    initials={initials}
                    size={128}
                    isEditing={isEditing}
                    isUploading={isUploadingWsAvatar}
                    onClick={() => {
                      if (isEditing && !isUploadingWsAvatar) {
                        wsFileInputRef.current?.click();
                      }
                    }}
                  />

                  <input
                    ref={wsFileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'workspace')}
                  />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Anzeigename */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                        Anzeigename
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={workspaceProfile.displayName}
                          onChange={(e) => setWorkspaceField('displayName', e.target.value)}
                          placeholder={profile.name || 'Anzeigename'}
                          style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#111827',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            padding: '6px 10px',
                            outline: 'none',
                            background: '#fff',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                          {effectiveWsDisplayName || '—'}
                        </div>
                      )}
                    </div>

                    {/* Rolle (read-only) */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>
                        Rolle
                      </div>
                      <div style={{ fontSize: '1rem', color: '#374151' }}>
                        {currentRole || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettings;
