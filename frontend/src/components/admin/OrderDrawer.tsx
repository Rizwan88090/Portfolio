'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarClock, Copy, Loader2, Mail, MessageCircle, Phone, Trash2, Wallet, X } from 'lucide-react';
import { STATUS, STATUS_KEYS, type Order, type StatusKey, whatsappNumber } from './types';

export default function OrderDrawer({
  order,
  onClose,
  onUpdate,
  onDelete,
  onToast,
}: {
  order: Order | null;
  onClose: () => void;
  onUpdate: (id: string, patch: { status?: StatusKey; notes?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onToast: (msg: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNotes(order?.notes ?? '');
    setConfirmDelete(false);
  }, [order?.id, order?.notes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const notesDirty = order && notes !== (order.notes ?? '');

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label={`Order from ${order.name}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-ink-900 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div className="min-w-0">
                <p className="text-xs text-mist">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <h2 className="mt-1 truncate font-display text-xl font-semibold text-white">{order.name}</h2>
                {order.company && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-mist">
                    <Building2 className="h-3.5 w-3.5" /> {order.company}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-mist hover:bg-white/5 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Contact actions */}
              <div className="grid grid-cols-3 gap-2">
                <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your ${order.service} project - Pentacore`)}`} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 text-xs text-white ring-1 ring-white/10 hover:bg-white/10">
                  <Mail className="h-4 w-4 text-brand-2" /> Email
                </a>
                <a
                  href={order.phone ? `tel:${order.phone}` : undefined}
                  aria-disabled={!order.phone}
                  className={`flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 text-xs ring-1 ring-white/10 ${order.phone ? 'text-white hover:bg-white/10' : 'pointer-events-none text-mist/40'}`}
                >
                  <Phone className="h-4 w-4 text-brand-2" /> Call
                </a>
                <a
                  href={order.phone ? `https://wa.me/${whatsappNumber(order.phone)}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!order.phone}
                  className={`flex flex-col items-center gap-1.5 rounded-xl bg-white/5 p-3 text-xs ring-1 ring-white/10 ${order.phone ? 'text-white hover:bg-white/10' : 'pointer-events-none text-mist/40'}`}
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp
                </a>
              </div>

              <dl className="divide-y divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/10">
                <Row label="Email">
                  <span className="flex items-center gap-2">
                    <span className="truncate">{order.email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(order.email);
                        onToast('Email copied');
                      }}
                      className="text-mist hover:text-white"
                      aria-label="Copy email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </Row>
                <Row label="Phone">{order.phone || '-'}</Row>
                <Row label="Service">{order.service}</Row>
                <Row label="Budget">
                  <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-mist" />{order.budget}</span>
                </Row>
                <Row label="Timeline">{order.timeline || '-'}</Row>
                <Row label="Received">
                  <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-mist" />{new Date(order.createdAt).toLocaleString()}</span>
                </Row>
              </dl>

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-mist uppercase">Project details</h3>
                <p className="rounded-xl bg-white/[0.03] p-4 text-sm leading-relaxed whitespace-pre-wrap text-white/90 ring-1 ring-white/10">
                  {order.message}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-mist uppercase">Status</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {STATUS_KEYS.map((k) => {
                    const S = STATUS[k];
                    const active = order.status === k;
                    return (
                      <button
                        key={k}
                        onClick={() => !active && onUpdate(order.id, { status: k })}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ring-1 transition ${
                          active ? S.badge : 'bg-white/[0.03] text-mist ring-white/10 hover:text-white'
                        }`}
                      >
                        <S.icon className="h-3.5 w-3.5" /> {S.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-mist uppercase">Internal notes</h3>
                <textarea
                  rows={4}
                  maxLength={5000}
                  className="field resize-none text-sm"
                  placeholder="Only your team sees these notes. Quote sent, call scheduled, next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    disabled={!notesDirty || saving}
                    onClick={async () => {
                      setSaving(true);
                      if (await onUpdate(order.id, { notes })) onToast('Notes saved');
                      setSaving(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-ink-950 disabled:opacity-40"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save notes
                  </button>
                </div>
              </section>
            </div>

            <footer className="border-t border-white/10 p-4">
              {confirmDelete ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/30">
                  <span className="text-sm text-rose-200">Delete this order permanently?</span>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-3 py-1.5 text-xs text-white hover:bg-white/10">
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (await onDelete(order.id)) onClose();
                      }}
                      className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" /> Delete order
                </button>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-mist">{label}</dt>
      <dd className="min-w-0 text-right text-white">{children}</dd>
    </div>
  );
}
