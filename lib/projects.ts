export type Project = {
  title: string;
  description: string;
  repoUrl: string;
  pagesUrl: string;
  status: 'active' | 'queued';
};

export const projects: Project[] = [
  {
    title: 'not-yet-site',
    description: 'A clean scaffold for the next stupid idea.',
    repoUrl: 'https://github.com/alvinhhh/not-yet-site',
    pagesUrl: 'projects/not-yet-site/',
    status: 'active',
  },
  {
    title: 'chess-chaos',
    description: 'Chess with a chaos clock. Blunders add 5 seconds to your time.',
    repoUrl: 'https://github.com/alvinhhh/chess-chaos',
    pagesUrl: 'projects/chess-chaos/',
    status: 'active',
  },
  {
    title: 'typo-speed-typing',
    description: 'A plain typing room. Keep it clean and keep it moving.',
    repoUrl: 'https://github.com/alvinhhh/typo-speed-typing',
    pagesUrl: 'projects/typo-speed-typing/',
    status: 'active',
  },
  {
    title: 'pitch-ipsum',
    description: 'Lorem Ipsum, but it sounds like a startup deck.',
    repoUrl: 'https://github.com/alvinhhh/pitch-ipsum',
    pagesUrl: 'projects/pitch-ipsum/',
    status: 'active',
  },
  {
    title: 'not-hotdog',
    description: 'A mobile net powered hot dog detector.',
    repoUrl: 'https://github.com/alvinhhh/not-hotdog',
    pagesUrl: 'projects/not-hotdog/',
    status: 'active',
  },
  {
    title: 'tc-life-ruiner',
    description: 'Highlights the most dangerous sentences in terms and conditions.',
    repoUrl: 'https://github.com/alvinhhh/tc-life-ruiner',
    pagesUrl: 'projects/tc-life-ruiner/',
    status: 'active',
  },
  {
    title: 'vc-rejection-clicker',
    description: 'Clicker game that generates unique VC rejection emails.',
    repoUrl: 'https://github.com/alvinhhh/vc-rejection-clicker',
    pagesUrl: 'projects/vc-rejection-clicker/',
    status: 'active',
  },
];

export function addProject(project: Project) {
  projects.unshift(project);
}
