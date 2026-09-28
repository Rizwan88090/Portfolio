import { ArrowUpRight, Lock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE, telHref } from '@/data/site';
import Logo from './Logo';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

const SERVICE_LINKS = [
  'Custom Web Applications',
  'Mobile Apps with Flutter',
  'AI & Machine Learning',
  'Automation with n8n',
  'Business Logic & APIs',
  'E-commerce Stores',
];

const COMPANY_LINKS = [
  { href: '#team', label: 'Our Team' },
  { href: '#process', label: 'How We Work' },
  { href: '#why', label: 'Why Pentacore' },
  { href: '#order', label: 'Start a Project' },
];

const whatsapp = `https://wa.me/92${SITE.phones[0].replace(/\D/g, '').replace(/^0/, '')}`;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer" className="relative overflow-hidden border-t border-white/5 bg-ink-900/40">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-brand-1/10 blur-[140px]" />

      {/* Call to action */}
      <div className="relative mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <Reveal>
          <div className="glass glow-border flex flex-col items-start justify-between gap-8 rounded-3xl p-8 sm:p-10 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-brand-2 uppercase">Let&apos;s work together</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Have a project in <span className="text-gradient">mind?</span>
              </h2>
              <p className="mt-3 max-w-md text-mist">
                Tell us about your idea and receive a clear scope and estimate within 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href="#order"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-1 to-brand-2 px-6 py-3.5 font-semibold text-white shadow-[0_10px_40px_-8px_rgb(139_92_246/0.7)]"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/5"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp us
                </a>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Link columns */}
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
            A Lahore-based software engineering studio building web platforms, mobile apps, AI solutions and
            automation for clients worldwide.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/25">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available for new projects
          </span>
        </div>

        <FooterColumn title="Services">
          {SERVICE_LINKS.map((s) => (
            <FooterLink key={s} href="#services">{s}</FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          {COMPANY_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Get in touch" className="col-span-2 lg:col-span-1">
          {SITE.phones.map((p) => (
            <li key={p}>
              <a href={telHref(p)} className="group flex items-center gap-3 text-mist transition hover:text-white">
                <IconBox><Phone className="h-4 w-4" /></IconBox>
                {p}
              </a>
            </li>
          ))}
          {SITE.email && (
            <li>
              <a href={`mailto:${SITE.email}`} className="group flex items-center gap-3 text-mist transition hover:text-white">
                <IconBox><Mail className="h-4 w-4" /></IconBox>
                {SITE.email}
              </a>
            </li>
          )}
          <li className="flex items-center gap-3 text-mist">
            <IconBox><MapPin className="h-4 w-4" /></IconBox>
            {SITE.city}
          </li>
        </FooterColumn>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-mist/80 sm:flex-row sm:px-6">
          <p className="flex items-center gap-3">
            © {year} {SITE.legalName}. All rights reserved.
            <a
              href="/admin"
              aria-label="Team login"
              title="Team login"
              className="group relative flex h-7 w-7 items-center justify-center rounded-full text-mist/60 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-brand-2 hover:ring-brand-2/40"
            >
              <Lock className="h-3.5 w-3.5 transition group-hover:scale-110" />
            </a>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Designed and engineered in {SITE.city}
          </p>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div
        aria-hidden
        className="pointer-events-none relative -mt-4 -mb-[0.22em] text-center font-display text-[18vw] leading-none font-bold tracking-tighter select-none lg:text-[13rem]"
        style={{
          background: 'linear-gradient(180deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Pentacore
      </div>
    </footer>
  );
}

function FooterColumn({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h3 className="mb-5 text-sm font-semibold tracking-wide text-white">{title}</h3>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="group inline-flex items-center gap-1 text-mist transition hover:text-white">
        <span className="relative">
          {children}
          <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-brand-1 to-brand-2 transition-transform duration-300 group-hover:scale-x-100" />
        </span>
        <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
      </a>
    </li>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-2 ring-1 ring-white/10 transition group-hover:bg-brand-1/20">
      {children}
    </span>
  );
}
