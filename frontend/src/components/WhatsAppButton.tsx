'use client';

import { useEffect, useState } from 'react';
import { SITE, whatsappHref } from '@/data/site';
import WhatsAppIcon from './WhatsAppIcon';

/** Floating WhatsApp chat button, bottom-right on every screen size. */
export default function WhatsAppButton() {
  const [show, setShow] = useState(false);

  // Appear shortly after load so it doesn't compete with the hero entrance.
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp, ${SITE.whatsappDisplay}`}
      title="Chat on WhatsApp"
      className={`group fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition duration-500 hover:scale-110 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s]" />
      <WhatsAppIcon className="relative h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden rounded-lg bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink-950 opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
