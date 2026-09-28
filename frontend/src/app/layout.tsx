import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { SITE } from '@/data/site';
import SmoothScroll from '@/components/SmoothScroll';
import CursorGlow from '@/components/CursorGlow';
import BackToTop from '@/components/BackToTop';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });

export const metadata: Metadata = {
  title: `${SITE.legalName} | Web, Mobile, AI & Automation`,
  description: SITE.description,
  keywords: [
    'software house',
    'Next.js',
    'Nest.js',
    'MERN',
    'Flutter',
    'AI engineering',
    'machine learning',
    'n8n automation',
    'custom websites',
  ],
  openGraph: {
    title: SITE.legalName,
    description: SITE.description,
    type: 'website',
  },
};

export const viewport: Viewport = { themeColor: '#05060f' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <SmoothScroll />
        <CursorGlow />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
