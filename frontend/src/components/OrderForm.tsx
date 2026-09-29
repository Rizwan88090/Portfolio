'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { BUDGETS, SERVICES, SITE, TIMELINES, telHref } from '@/data/site';
import { API_URL } from '@/lib/api';
import Reveal, { SectionHeading } from './Reveal';

type Status = 'idle' | 'sending' | 'done' | 'error';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: SERVICES[0] as string,
  budget: BUDGETS[1] as string,
  timeline: TIMELINES[1] as string,
  message: '',
};

export default function OrderForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ''));
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
        throw new Error(res.status === 429 ? 'Too many requests. Please wait a minute and try again.' : msg || 'Something went wrong.');
      }
      setStatus('done');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof TypeError
          ? `We could not reach our server. Please call or WhatsApp us at ${SITE.phones[0]}.`
          : (err as Error).message,
      );
    }
  }

  return (
    <section id="order" className="relative scroll-mt-24 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[500px] max-w-4xl rounded-full blob-violet" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Start a project"
          title="Tell us about"
          highlight="your project."
          text="Share a few details and our project manager will respond within 24 hours with next steps and an estimate."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <div className="glass glow-border flex h-full flex-col gap-6 rounded-3xl p-8">
              <h3 className="font-display text-2xl font-semibold text-white">Let&apos;s talk</h3>
              <p className="text-mist">
                Whether you need a web app, a mobile app, an AI feature or an automation, every project begins with a free consultation.
              </p>
              <ul className="space-y-4 text-sm">
                {SITE.email && (
                  <li className="flex items-center gap-3 text-white">
                    <Mail className="h-5 w-5 text-brand-2" />
                    <a href={`mailto:${SITE.email}`} className="hover:text-brand-2">{SITE.email}</a>
                  </li>
                )}
                {SITE.phones.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-white">
                    <Phone className="h-5 w-5 text-brand-2" />
                    <a href={telHref(p)} className="hover:text-brand-2">{p}</a>
                  </li>
                ))}
                <li className="flex items-center gap-3 text-white">
                  <MapPin className="h-5 w-5 text-brand-2" />
                  {SITE.location}
                </li>
              </ul>
              <div className="mt-auto rounded-2xl bg-white/5 p-5 text-sm text-mist ring-1 ring-white/10">
                <span className="font-semibold text-white">Free consultation.</span> No commitment until you
                approve the scope and estimate.
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={submit} className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <AnimatePresence>
                {status === 'done' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink-900/95 p-8 text-center"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <CheckCircle2 className="h-16 w-16 text-brand-2" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-semibold text-white">Order received!</h3>
                    <p className="max-w-sm text-mist">Thank you. Our team will be in touch within 24 hours.</p>
                    <button type="button" onClick={() => setStatus('idle')} className="mt-2 text-sm text-brand-2 hover:underline">
                      Send another request
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name *">
                  <input required maxLength={120} className="field" value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name" />
                </Field>
                <Field label="Email *">
                  <input required type="email" maxLength={160} className="field" value={form.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" />
                </Field>
                <Field label="Phone / WhatsApp">
                  <input maxLength={40} className="field" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" autoComplete="tel" />
                </Field>
                <Field label="Company">
                  <input maxLength={160} className="field" value={form.company} onChange={set('company')} placeholder="Company name" autoComplete="organization" />
                </Field>
                <Field label="Service *">
                  <select className="field" value={form.service} onChange={set('service')}>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Budget *">
                  <select className="field" value={form.budget} onChange={set('budget')}>
                    {BUDGETS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Timeline" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, timeline: t }))}
                        className={`rounded-full px-4 py-2 text-sm ring-1 transition ${
                          form.timeline === t
                            ? 'bg-gradient-to-r from-brand-1 to-brand-2 text-white ring-transparent'
                            : 'bg-white/5 text-mist ring-white/10 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Project details *" className="sm:col-span-2">
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    className="field resize-none"
                    value={form.message}
                    onChange={set('message')}
                    placeholder="What are you building? Who is it for? Any features or links we should see?"
                  />
                </Field>
              </div>

              {status === 'error' && (
                <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-1 via-brand-1 to-brand-2 px-6 py-4 font-semibold text-white shadow-[0_10px_40px_-8px_rgb(139_92_246/0.7)] transition hover:brightness-110 disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Place your order <Send className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-medium tracking-wide text-mist">{label}</span>
      {children}
    </label>
  );
}
