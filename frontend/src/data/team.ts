export type TeamMember = {
  slug: string;
  name: string;
  initials: string;
  role: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  /** Put the photo at frontend/public/team/<file>. Missing photos fall back to initials. */
  image: string;
  accent: string;
};

// Keep in sync with backend/src/team/team.seed.ts
export const TEAM: TeamMember[] = [
  {
    slug: 'azaan-saeed',
    name: 'Azaan Saeed',
    initials: 'AS',
    role: 'Mobile Engineer · Flutter & Automation',
    bio: 'Develops polished cross-platform mobile apps with Flutter and Dart, and automates end-to-end business workflows with n8n.',
    skills: ['Flutter', 'Dart', 'iOS & Android Development', 'Firebase Integration', 'n8n Workflow Automation', 'REST API Integration'],
    experienceYears: 5,
    image: '/team/azaan.jpg',
    accent: '#38bdf8',
  },
  {
    slug: 'muhammad-rizwan',
    name: 'Muhammad Rizwan',
    initials: 'MR',
    role: 'Full-Stack Engineer · NestJS & Next.js',
    bio: 'Architects custom platforms and complex business logic, specialising in scalable NestJS back ends and high-performance Next.js front ends.',
    skills: ['NestJS', 'Next.js', 'Node.js', 'TypeScript', 'System Architecture', 'RESTful API Design'],
    experienceYears: 5,
    image: '/team/rizwan.jpg',
    accent: '#22d3ee',
  },
  {
    slug: 'mahar-muhammad-asjad',
    name: 'Mahar Muhammad Asjad',
    initials: 'MA',
    role: 'Full-Stack Engineer · MERN Stack',
    bio: 'Builds fast, bespoke websites and web applications on the MERN stack, from pixel-perfect React interfaces to robust Node.js APIs.',
    skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Custom Web Development', 'Responsive UI Development'],
    experienceYears: 5,
    image: '/team/asjad.jpg',
    accent: '#f472b6',
  },
  {
    slug: 'ateeq-haider',
    name: 'Ateeq Haider',
    initials: 'AH',
    role: 'Software Project Manager & Web Developer',
    bio: 'Leads delivery from start to finish, turning client goals into clear roadmaps, running agile sprints and contributing production React and Node.js code.',
    skills: ['Software Project Management', 'Agile & Scrum', 'Requirements Analysis', 'Client Relations', 'React', 'Node.js'],
    experienceYears: 5,
    image: '/team/ateeq.jpg',
    accent: '#8b5cf6',
  },
  {
    slug: 'tayyab-fayyaz',
    name: 'Tayyab Fayyaz',
    initials: 'TF',
    role: 'AI Engineer · Machine Learning',
    bio: 'Designs, trains and deploys machine learning models and AI features that give products a genuine competitive edge.',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'Model Training & Fine-Tuning', 'LLM Applications', 'Data Analysis'],
    experienceYears: 5,
    image: '/team/tayyab.jpg',
    accent: '#a78bfa',
  },
];
