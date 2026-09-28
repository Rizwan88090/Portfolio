'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, X } from 'lucide-react';
import { API_URL } from '@/lib/api';
import type { Admin } from './types';

export default function ChangePasswordModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: (admin: Admin) => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError('');
    setShow(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) return setError('New password must be at least 8 characters long.');
    if (next !== confirm) return setError('The new passwords do not match.');
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
        throw new Error(res.status === 429 ? 'Too many attempts. Please wait a minute.' : msg || 'Could not change the password.');
      }
      onChanged(body.admin);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof TypeError ? 'Cannot reach the server.' : (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const strength = next.length === 0 ? 0 : [next.length >= 8, /[A-Z]/.test(next) && /[a-z]/.test(next), /\d/.test(next), /[^A-Za-z0-9]/.test(next)].filter(Boolean).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { reset(); onClose(); }} />
          <motion.form
            onSubmit={submit}
            role="dialog"
            aria-label="Change password"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-brand-1/15 p-2.5 text-violet-300 ring-1 ring-brand-1/30"><Lock className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Change password</h2>
                  <p className="text-xs text-mist">Other devices will be signed out.</p>
                </div>
              </div>
              <button type="button" onClick={() => { reset(); onClose(); }} className="rounded-lg p-1.5 text-mist hover:bg-white/5 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <PwField label="Current password" value={current} onChange={setCurrent} show={show} autoComplete="current-password" autoFocus />
              <PwField label="New password" value={next} onChange={setNext} show={show} autoComplete="new-password" />
              {next && (
                <div className="-mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? (strength >= 3 ? 'bg-emerald-400' : strength === 2 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="w-12 text-right text-[11px] text-mist">{strengthLabel}</span>
                </div>
              )}
              <PwField label="Confirm new password" value={confirm} onChange={setConfirm} show={show} autoComplete="new-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="flex items-center gap-1.5 text-xs text-mist hover:text-white">
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {show ? 'Hide' : 'Show'} passwords
              </button>
            </div>

            {error && <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-200 ring-1 ring-rose-500/30">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { reset(); onClose(); }} className="rounded-xl px-4 py-2 text-sm text-white hover:bg-white/5">Cancel</button>
              <button disabled={saving || !current || !next || !confirm} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-1 to-brand-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update password
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PwField({
  label,
  value,
  onChange,
  show,
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-mist">{label}</span>
      <input
        type={show ? 'text' : 'password'}
        className="field text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={200}
        required
      />
    </label>
  );
}
