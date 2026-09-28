// Company-wide content. Edit here to change text across the site.
export const SITE = {
  name: 'Pentacore',
  legalName: 'Pentacore Technologies',
  tagline: 'Five senior engineers. One standard of excellence.',
  description:
    'Pentacore Technologies is a software house of five senior engineers building custom web platforms, Flutter mobile apps, AI and machine-learning products, and n8n automation.',
  // TODO: add the company email. While empty, email links are hidden.
  email: '',
  phones: ['0309 5693653', '0346 1416947'],
  city: 'Lahore, Pakistan',
  location: 'Lahore, Pakistan · Serving clients worldwide',
};

/** Pakistani local number to an international tel: link, e.g. 0309... -> +92309... */
export const telHref = (p: string) => `tel:+92${p.replace(/\D/g, '').replace(/^0/, '')}`;

// Keep in sync with backend/src/orders/dto/create-order.dto.ts
export const SERVICES = [
  'Custom Web Application',
  'Mobile App (Flutter)',
  'AI / Machine Learning',
  'Automation (n8n)',
  'Business Logic & APIs',
  'E-commerce Store',
  'Project Consulting',
  'Other',
] as const;

export const BUDGETS = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $15,000',
  '$15,000 - $50,000',
  '$50,000+',
] as const;

export const TIMELINES = ['ASAP', '2 - 4 weeks', '1 - 3 months', '3+ months', 'Flexible'] as const;

export const TECH = [
  'Next.js',
  'Nest.js',
  'React',
  'Node.js',
  'TypeScript',
  'PostgreSQL',
  'MongoDB',
  'Express',
  'Flutter',
  'Dart',
  'Python',
  'PyTorch',
  'TensorFlow',
  'n8n',
  'Docker',
  'AWS',
  'Firebase',
  'LLMs & AI Agents',
];
