import { BrainCircuit, Code2, Layers, Smartphone, Workflow, ShoppingBag, Compass, Server } from 'lucide-react';
import Reveal, { SectionHeading } from './Reveal';
import TiltCard from './TiltCard';

const SERVICES = [
  {
    icon: Code2,
    title: 'Custom Web Applications',
    text: 'High-performance platforms, dashboards and SaaS products built with Next.js, React and Nest.js.',
    tags: ['Next.js', 'React', 'Nest.js'],
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps with Flutter',
    text: 'A single codebase delivering a native experience on iOS and Android, with fluid animations and production-ready releases.',
    tags: ['Flutter', 'Dart', 'Firebase'],
  },
  {
    icon: BrainCircuit,
    title: 'AI & Machine Learning',
    text: 'Custom model training, LLM integrations, AI agents and data pipelines that create real business value.',
    tags: ['Python', 'PyTorch', 'LLMs'],
  },
  {
    icon: Workflow,
    title: 'Automation with n8n',
    text: 'Connect your tools and eliminate repetitive work by automating CRMs, email, spreadsheets, payments and AI workflows.',
    tags: ['n8n', 'APIs', 'Webhooks'],
  },
  {
    icon: Server,
    title: 'Business Logic & APIs',
    text: 'Secure, scalable back ends that model your real workflows, including roles, billing, reporting and integrations.',
    tags: ['Node.js', 'PostgreSQL', 'REST'],
  },
  {
    icon: Layers,
    title: 'MERN Stack Products',
    text: 'Fast, bespoke websites and web apps on MongoDB, Express, React and Node.js.',
    tags: ['MongoDB', 'Express', 'Node.js'],
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce Stores',
    text: 'Conversion-focused stores with custom checkout, inventory, payments and admin panels.',
    tags: ['Payments', 'Admin', 'SEO'],
  },
  {
    icon: Compass,
    title: 'Project Consulting',
    text: 'Roadmaps, architecture reviews and agile delivery management led by an experienced project manager.',
    tags: ['Agile', 'Architecture', 'Planning'],
  },
];

export default function Services() {
  return (
    <section id="services" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="What we do"
        title="End-to-end engineering"
        highlight="from a single senior team."
        text="From initial concept to launch and beyond, every discipline your product requires is available under one roof."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 4) * 0.08}>
            <TiltCard className="h-full rounded-3xl">
              <div className="shine glass h-full rounded-3xl p-6 transition group-hover:border-brand-1/40">
                <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-brand-1/30 to-brand-2/20 p-3 text-white ring-1 ring-white/10 transition duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_24px_-4px_rgb(139_92_246/0.8)]">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{s.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-mist ring-1 ring-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
