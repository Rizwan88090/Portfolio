import {
  CheckCircle2,
  Eye,
  Hammer,
  Inbox,
  ThumbsUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type Order = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service: string;
  budget: string;
  timeline?: string | null;
  message: string;
  notes?: string | null;
  status: StatusKey;
  createdAt: string;
  updatedAt: string;
};

export type StatusKey = 'new' | 'in_review' | 'accepted' | 'in_progress' | 'completed' | 'rejected';

export const STATUS: Record<StatusKey, { label: string; icon: LucideIcon; badge: string; dot: string }> = {
  new: { label: 'New', icon: Inbox, badge: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/25', dot: 'bg-cyan-400' },
  in_review: { label: 'In review', icon: Eye, badge: 'bg-amber-400/10 text-amber-300 ring-amber-400/25', dot: 'bg-amber-400' },
  accepted: { label: 'Accepted', icon: ThumbsUp, badge: 'bg-violet-400/10 text-violet-300 ring-violet-400/25', dot: 'bg-violet-400' },
  in_progress: { label: 'In progress', icon: Hammer, badge: 'bg-sky-400/10 text-sky-300 ring-sky-400/25', dot: 'bg-sky-400' },
  completed: { label: 'Completed', icon: CheckCircle2, badge: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', icon: XCircle, badge: 'bg-rose-400/10 text-rose-300 ring-rose-400/25', dot: 'bg-rose-400' },
};

export const STATUS_KEYS = Object.keys(STATUS) as StatusKey[];

/** Rough midpoint of each budget band, used only for the "estimated pipeline" figure. */
const BUDGET_MIDPOINT: Record<string, number> = {
  'Under $1,000': 500,
  '$1,000 - $5,000': 3000,
  '$5,000 - $15,000': 10000,
  '$15,000 - $50,000': 32500,
  '$50,000+': 50000,
};
export const budgetValue = (b: string) => BUDGET_MIDPOINT[b] ?? 0;

export const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}k` : `$${n}`;

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Digits for wa.me links. Pakistani local numbers (03xx) become 923xx. */
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
}

export function toCsv(orders: Order[]) {
  const cols: (keyof Order)[] = ['createdAt', 'name', 'email', 'phone', 'company', 'service', 'budget', 'timeline', 'status', 'message', 'notes'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...orders.map((o) => cols.map((c) => esc(o[c])).join(','))].join('\n');
}

export type Admin = {
  id: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
};
