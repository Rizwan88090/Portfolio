'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  Inbox,
  AlertTriangle,
  KeyRound,
  Lock,
  Mail,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  Hammer,
  CheckCircle2,
  X,
  type LucideIcon,
} from 'lucide-react';
import Logo, { LogoMark } from '@/components/Logo';
import { API_URL } from '@/lib/api';
import { DailyOrdersChart, ServiceChart } from '@/components/admin/Charts';
import OrderDrawer from '@/components/admin/OrderDrawer';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import { STATUS, STATUS_KEYS, budgetValue, money, timeAgo, toCsv, type Admin, type Order, type StatusKey } from '@/components/admin/types';

const REFRESH_MS = 60_000;

/** Every admin request sends the httpOnly session cookie. */
const apiFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me')
      .then(async (r) => (r.ok ? setAdmin((await r.json()).admin) : setAdmin(null)))
      .catch(() => setAdmin(null))
      .finally(() => setReady(true));
  }, []);

  const signOut = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null);
    setAdmin(null);
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-mist" />
      </main>
    );
  }
  return admin ? (
    <Dashboard admin={admin} onAdminChange={setAdmin} onSignOut={signOut} onExpired={() => setAdmin(null)} />
  ) : (
    <Login onSignedIn={setAdmin} />
  );
}

/* ------------------------------------------------------------------ */

function Login({ onSignedIn }: { onSignedIn: (a: Admin) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError('');
    try {
      const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
      const body = await res.json().catch(() => ({}));
      if (res.status === 429) throw new Error('Too many sign-in attempts. Please wait a minute and try again.');
      if (res.status === 401 || res.status === 400) throw new Error('Incorrect email or password.');
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      onSignedIn(body.admin);
    } catch (err) {
      setError(err instanceof TypeError ? 'Cannot reach the server. Is the backend running?' : (err as Error).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-1/20 blur-[140px]" />
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-border relative w-full max-w-sm rounded-3xl p-8"
      >
        <LogoMark size={44} />
        <h1 className="mt-6 font-display text-2xl font-semibold text-white">Pentacore Console</h1>
        <p className="mt-1 text-sm text-mist">Sign in with your admin account.</p>

        <label className="mt-8 block">
          <span className="mb-2 block text-xs font-medium text-mist">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="email"
              required
              className="field !pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              autoFocus
            />
          </div>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-medium text-mist">Password</span>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type={show ? 'text' : 'password'}
              required
              className="field !pr-16 !pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-mist hover:text-white"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        <button
          disabled={checking}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-1 to-brand-2 py-3 font-semibold text-white disabled:opacity-60"
        >
          {checking && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
        <a href="/" className="mt-6 block text-center text-xs text-mist hover:text-white">
          Back to website
        </a>
      </motion.form>
    </main>
  );
}

/* ------------------------------------------------------------------ */

type View = 'overview' | 'orders';

function Dashboard({
  admin,
  onAdminChange,
  onSignOut,
  onExpired,
}: {
  admin: Admin;
  onAdminChange: (a: Admin) => void;
  onSignOut: () => void;
  onExpired: () => void;
}) {
  const [pwOpen, setPwOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [view, setView] = useState<View>('overview');
  const [filter, setFilter] = useState<StatusKey | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }, []);

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    const res = await apiFetch(path, init);
    if (res.status === 401) onExpired();
    return res;
  }, [onExpired]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/orders');
      if (res.status === 401) return;
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      setOrders(await res.json());
      setError('');
      setLastSync(new Date());
    } catch (e) {
      setError(e instanceof TypeError ? 'Cannot reach the API. Is the backend running?' : (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const updateOrder = useCallback(
    async (id: string, patch: { status?: StatusKey; notes?: string }) => {
      const prev = orders;
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      const res = await api(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }).catch(() => null);
      if (!res?.ok) {
        setOrders(prev);
        showToast('Could not save the change');
        return false;
      }
      const saved: Order = await res.json();
      setOrders((os) => os.map((o) => (o.id === id ? saved : o)));
      if (patch.status) showToast(`Marked as ${STATUS[patch.status].label}`);
      return true;
    },
    [api, orders, showToast],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const res = await api(`/orders/${id}`, { method: 'DELETE' }).catch(() => null);
      if (!res?.ok) {
        showToast('Could not delete the order');
        return false;
      }
      setOrders((os) => os.filter((o) => o.id !== id));
      showToast('Order deleted');
      return true;
    },
    [api, showToast],
  );

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pentacore-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0])) as Record<StatusKey, number>;
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  const kpis = useMemo(() => {
    const open = orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected');
    const weekAgo = Date.now() - 7 * 864e5;
    return {
      total: orders.length,
      thisWeek: orders.filter((o) => new Date(o.createdAt).getTime() > weekAgo).length,
      newCount: counts.new,
      active: counts.accepted + counts.in_progress,
      completed: counts.completed,
      pipeline: open.reduce((s, o) => s + budgetValue(o.budget), 0),
    };
  }, [orders, counts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q || [o.name, o.email, o.company, o.service, o.phone].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [orders, filter, query]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const NAV = [
    { id: 'overview' as View, label: 'Overview', icon: LayoutDashboard },
    { id: 'orders' as View, label: 'Orders', icon: Inbox, badge: counts.new },
  ];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Logo />
        <p className="mt-1 pl-[46px] text-[11px] tracking-wider text-mist/70 uppercase">Console</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setView(n.id);
              setNavOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              view === n.id ? 'bg-white/[0.07] text-white ring-1 ring-white/10' : 'text-mist hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <n.icon className="h-4 w-4" />
            <span className="flex-1 text-left">{n.label}</span>
            {!!n.badge && (
              <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">{n.badge} new</span>
            )}
          </button>
        ))}
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist hover:bg-white/[0.04] hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
      </nav>
      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-mist">
          <span className={`h-2 w-2 rounded-full ${error ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          {error ? 'API offline' : 'API connected'}
        </div>
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/5">
          <Avatar name={admin.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{admin.name}</p>
            <p className="truncate text-[11px] text-mist">{admin.email}</p>
          </div>
        </div>
        <button onClick={() => setPwOpen(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-mist hover:bg-white/[0.04] hover:text-white">
          <Lock className="h-4 w-4" /> Change password
        </button>
        <button onClick={onSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-mist hover:bg-white/[0.04] hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/5 bg-ink-900/60 lg:block">{sidebar}</aside>
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-ink-900 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="nav-glass sticky top-0 z-30 !rounded-none !border-x-0 !border-t-0 !shadow-none">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button onClick={() => setNavOpen(true)} className="rounded-lg p-2 text-white lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setView('orders');
                }}
                placeholder="Search name, email, company, service..."
                className="field !rounded-xl !py-2 !pl-9 text-sm"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-mist sm:inline">{lastSync ? `Synced ${timeAgo(lastSync.toISOString())}` : ''}</span>
              <button onClick={load} className="rounded-xl p-2.5 text-mist ring-1 ring-white/10 hover:bg-white/5 hover:text-white" aria-label="Refresh" title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">
          {admin.mustChangePassword && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ring-1 ring-amber-400/30">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
                You are still using the initial password. Please set your own password.
              </span>
              <button onClick={() => setPwOpen(true)} className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-semibold text-ink-950">
                Change password
              </button>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
              {error}
              <button onClick={load} className="font-semibold underline">Retry</button>
            </div>
          )}

          {view === 'overview' ? (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Overview</h1>
                  <p className="mt-1 text-sm text-mist">Welcome back, {admin.name.split(' ')[0]}. Here is how client demand looks right now.</p>
                </div>
                <button onClick={() => setView('orders')} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                  Open orders <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Kpi icon={TrendingUp} label="Total orders" value={kpis.total} sub={`${kpis.thisWeek} in the last 7 days`} />
                <Kpi icon={Inbox} label="Awaiting reply" value={kpis.newCount} sub="Status: New" highlight={kpis.newCount > 0} />
                <Kpi icon={Hammer} label="Active projects" value={kpis.active} sub="Accepted + in progress" />
                <Kpi icon={Wallet} label="Open pipeline" value={money(kpis.pipeline)} sub="Estimated from budget ranges" />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Panel><DailyOrdersChart orders={orders} /></Panel>
                <Panel><ServiceChart orders={orders} /></Panel>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.6fr]">
                <Panel>
                  <h2 className="mb-4 text-sm font-semibold text-white">Status breakdown</h2>
                  <ul className="space-y-2.5">
                    {STATUS_KEYS.map((k) => {
                      const S = STATUS[k];
                      return (
                        <li key={k}>
                          <button onClick={() => { setFilter(k); setView('orders'); }} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/[0.04]">
                            <S.icon className="h-4 w-4 text-mist" />
                            <span className="flex-1 text-left text-mist">{S.label}</span>
                            <span className="font-semibold text-white">{counts[k]}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-mist">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {kpis.completed} completed so far
                  </div>
                </Panel>
                <Panel>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Latest orders</h2>
                    <button onClick={() => setView('orders')} className="text-xs text-brand-2 hover:underline">View all</button>
                  </div>
                  {orders.length === 0 ? (
                    <Empty loading={loading} />
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {orders.slice(0, 5).map((o) => (
                        <li key={o.id}>
                          <button onClick={() => setSelectedId(o.id)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.02]">
                            <Avatar name={o.name} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">{o.name}</p>
                              <p className="truncate text-xs text-mist">{o.service} · {o.budget}</p>
                            </div>
                            <StatusBadge status={o.status} />
                            <span className="hidden w-16 text-right text-xs text-mist sm:block">{timeAgo(o.createdAt)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Orders</h1>
                  <p className="mt-1 text-sm text-mist">
                    {filtered.length} of {orders.length} orders{query && ` matching "${query}"`}
                  </p>
                </div>
                <button onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-40">
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              </div>

              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" count={orders.length} />
                {STATUS_KEYS.map((k) => (
                  <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)} label={STATUS[k].label} count={counts[k]} dot={STATUS[k].dot} />
                ))}
              </div>

              <Panel className="!p-0 overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="p-10"><Empty loading={loading} filtered={orders.length > 0} /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-xs text-mist">
                          <th className="px-5 py-3 font-medium">Client</th>
                          <th className="px-5 py-3 font-medium">Service</th>
                          <th className="px-5 py-3 font-medium">Budget</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 text-right font-medium">Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filtered.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => setSelectedId(o.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedId(o.id)}
                            tabIndex={0}
                            className="cursor-pointer transition hover:bg-white/[0.03] focus:bg-white/[0.03] focus:outline-none"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={o.name} />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-white">
                                    {o.name}
                                    {o.company && <span className="font-normal text-mist"> · {o.company}</span>}
                                  </p>
                                  <p className="truncate text-xs text-mist">{o.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-white/90">{o.service}</td>
                            <td className="px-5 py-3.5 text-white/90">{o.budget}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                            <td className="px-5 py-3.5 text-right text-xs text-mist" title={new Date(o.createdAt).toLocaleString()}>
                              {timeAgo(o.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </>
          )}
        </main>
      </div>

      <OrderDrawer
        order={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={updateOrder}
        onDelete={deleteOrder}
        onToast={showToast}
      />

      <ChangePasswordModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        onChanged={(a) => {
          onAdminChange(a);
          showToast('Password updated');
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-950 shadow-2xl"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {toast}
            <button onClick={() => setToast('')} aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/[0.07] bg-ink-900/70 p-5 sm:p-6 ${className}`}>{children}</section>;
}

function Kpi({ icon: Icon, label, value, sub, highlight }: { icon: LucideIcon; label: string; value: React.ReactNode; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-ink-900/70 p-5 ${highlight ? 'border-cyan-400/30' : 'border-white/[0.07]'}`}>
      <div className="flex items-center justify-between text-xs text-mist">
        {label}
        <span className="rounded-lg bg-white/5 p-1.5"><Icon className="h-3.5 w-3.5" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-mist">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusKey }) {
  const S = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ${S.badge}`}>
      <S.icon className="h-3 w-3" /> {S.label}
    </span>
  );
}

function FilterChip({ active, onClick, label, count, dot }: { active: boolean; onClick: () => void; label: string; count: number; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm ring-1 transition ${
        active ? 'bg-white text-ink-950 ring-white' : 'text-mist ring-white/10 hover:text-white'
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
      <span className={`text-xs ${active ? 'text-ink-950/60' : 'text-mist/70'}`}>{count}</span>
    </button>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-1/40 to-brand-2/30 text-xs font-semibold text-white ring-1 ring-white/10">
      {initials}
    </span>
  );
}

function Empty({ loading, filtered }: { loading: boolean; filtered?: boolean }) {
  if (loading) return <p className="flex items-center justify-center gap-2 py-6 text-sm text-mist"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders...</p>;
  return (
    <div className="py-6 text-center">
      <Inbox className="mx-auto h-8 w-8 text-mist/50" />
      <p className="mt-3 text-sm text-white">{filtered ? 'No orders match these filters' : 'No orders yet'}</p>
      <p className="mt-1 text-xs text-mist">{filtered ? 'Try another status or clear the search.' : 'New orders from the website will appear here.'}</p>
    </div>
  );
}
