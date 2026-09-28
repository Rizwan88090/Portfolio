import { ShieldCheck, Gauge, MessagesSquare, Rocket, Users, LifeBuoy } from 'lucide-react';
import Reveal, { SectionHeading } from './Reveal';

const POINTS = [
  { icon: Users, title: 'Senior-only team', text: 'Five engineers with over five years of experience each. You work directly with the people building your product.' },
  { icon: Gauge, title: 'Built for speed', text: 'Modern technology, fast load times and code that scales from your first user to your millionth.' },
  { icon: MessagesSquare, title: 'Transparent delivery', text: 'A dedicated project manager, weekly demos and clear communication in English and Urdu.' },
  { icon: ShieldCheck, title: 'Secure by default', text: 'Input validation, rate limiting, access control and security best practices built in from day one.' },
  { icon: Rocket, title: 'AI-ready products', text: 'Add machine learning, large language models and automation to your product with an in-house AI engineer.' },
  { icon: LifeBuoy, title: 'Long-term support', text: 'Maintenance, monitoring and new features after launch. We work as your long-term partner, not a one-off vendor.' },
];

export default function WhyUs() {
  return (
    <section id="why" className="relative scroll-mt-24 py-24">
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full bg-brand-2/10 blur-[140px]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Why Pentacore" title="Product-team quality," highlight="partner-level commitment." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.08}>
              <div className="shine group glass h-full rounded-3xl p-7 transition duration-500 hover:-translate-y-1.5 hover:border-brand-2/30 hover:shadow-[0_20px_50px_-20px_rgb(34_211_238/0.35)]">
                <p.icon className="h-7 w-7 text-brand-2 transition group-hover:scale-110" />
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
