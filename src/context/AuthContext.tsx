import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ACCESS, AUTH_EMAILS, hashPassword } from '../config/access';
import type { Role } from '../config/access';
import { supabase } from '../lib/supabase';
import { loadJson, saveJson, removeKey, STORAGE_KEYS } from '../utils/storage';

const AUTH_KEY = STORAGE_KEYS.auth;
const DISPLAY_NAME_KEY = STORAGE_KEYS.displayName;

interface AuthContextValue {
  role: Role;
  /** True while the stored credential is being re-checked on startup. */
  ready: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** True when Supabase Auth has a live session (required for DB writes). */
  hasDbSession: boolean;
  signIn: (password: string) => Promise<Role | null>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function roleForHash(hash: string): Role {
  if (hash === ACCESS.ownerHash) return 'owner';
  if (hash === ACCESS.editorHash) return 'editor';
  return 'viewer';
}

function roleForEmail(email: string | undefined): Role {
  if (email === AUTH_EMAILS.owner) return 'owner';
  if (email === AUTH_EMAILS.editor) return 'editor';
  return 'viewer';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('viewer');
  const [ready, setReady] = useState(false);
  const [hasDbSession, setHasDbSession] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // No shared DB — local hash unlock is enough for browsing a static copy.
      const stored = loadJson<string>(AUTH_KEY, (v): v is string => typeof v === 'string');
      if (stored) {
        const restored = roleForHash(stored);
        if (restored === 'viewer') removeKey(AUTH_KEY);
        else setRole(restored);
      }
      setReady(true);
      return;
    }

    // Supabase is configured: a legacy password-hash in localStorage must NOT
    // unlock the UI. That path used to set role=owner with no JWT, so every
    // save hit Row Level Security and looked like "database broken".
    removeKey(AUTH_KEY);

    void supabase.auth.getSession().then(({ data }) => {
      const fromSession = roleForEmail(data.session?.user.email);
      setHasDbSession(Boolean(data.session) && fromSession !== 'viewer');
      if (fromSession !== 'viewer') setRole(fromSession);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const fromSession = roleForEmail(session?.user.email);
      setHasDbSession(Boolean(session) && fromSession !== 'viewer');
      if (fromSession !== 'viewer') {
        setRole(fromSession);
      } else {
        setRole('viewer');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (password: string): Promise<Role | null> => {
    if (supabase) {
      // Real authentication only — one shared password per role.
      for (const email of [AUTH_EMAILS.owner, AUTH_EMAILS.editor]) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.session) {
          const found = roleForEmail(data.session.user.email);
          if (found !== 'viewer') {
            removeKey(AUTH_KEY);
            setHasDbSession(true);
            setRole(found);
            return found;
          }
        }
      }
      // Do not fall back to hash-only when the DB is configured: without a
      // Supabase session, RLS rejects every write.
      return null;
    }

    const hash = await hashPassword(password);
    const found = roleForHash(hash);
    if (found === 'viewer') return null;
    saveJson(AUTH_KEY, hash);
    setRole(found);
    return found;
  }, []);

  const signOut = useCallback(() => {
    if (supabase) void supabase.auth.signOut();
    removeKey(AUTH_KEY);
    // Next visitor must enter their own name after the password.
    removeKey(DISPLAY_NAME_KEY);
    setHasDbSession(false);
    setRole('viewer');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      ready,
      canEdit: role === 'editor' || role === 'owner',
      canDelete: role === 'owner',
      hasDbSession,
      signIn,
      signOut,
    }),
    [role, ready, hasDbSession, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
