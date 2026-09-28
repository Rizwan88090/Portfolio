import type Lenis from 'lenis';

type WithLenis = Window & { __lenis?: Lenis };

export function getLenis() {
  return typeof window === 'undefined' ? undefined : (window as WithLenis).__lenis;
}

export function setLenis(l?: Lenis) {
  (window as WithLenis).__lenis = l;
}

/** Smoothly scroll to a section id (or the top), accounting for the fixed navbar. */
export function scrollToId(id: string) {
  const lenis = getLenis();
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: -80 });
  } else if (target === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
}
