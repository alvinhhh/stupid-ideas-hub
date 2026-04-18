export type Project = {
  title: string;
  description: string;
  repoUrl: string;
  pagesUrl: string;
  status: 'active' | 'queued';
};

export const projects: Project[] = [
  {
    title: 'chess-chaos',
    description: 'Chess with a chaos clock. Blunders add 5 seconds to your time.',
    repoUrl: 'https://github.com/alvinhhh/chess-chaos',
    pagesUrl: 'https://alvinhhh.github.io/stupid-ideas-hub/projects/chess-chaos/',
    status: 'active',
  },
  {
    title: 'pitch-ipsum',
    description: 'Lorem Ipsum, but it sounds like a startup deck.',
    repoUrl: 'https://github.com/alvinhhh/pitch-ipsum',
    pagesUrl: 'https://alvinhhh.github.io/stupid-ideas-hub/projects/pitch-ipsum/',
    status: 'active',
  },
  {
    title: 'not-hotdog',
    description: 'A mobile net powered hot dog detector.',
    repoUrl: 'https://github.com/alvinhhh/not-hotdog',
    pagesUrl: 'https://alvinhhh.github.io/stupid-ideas-hub/projects/not-hotdog/',
    status: 'active',
  },
  {
    title: 'tc-life-ruiner',
    description: 'Highlights the most dangerous sentences in terms and conditions.',
    repoUrl: 'https://github.com/alvinhhh/tc-life-ruiner',
    pagesUrl: 'https://alvinhhh.github.io/stupid-ideas-hub/projects/tc-life-ruiner/',
    status: 'active',
  },
  {
    title: 'vc-rejection-clicker',
    description: 'Clicker game that generates unique VC rejection emails.',
    repoUrl: 'https://github.com/alvinhhh/vc-rejection-clicker',
    pagesUrl: 'https://alvinhhh.github.io/stupid-ideas-hub/projects/vc-rejection-clicker/',
    status: 'active',
  },
];

export function addProject(project: Project) {
  projects.unshift(project);
}
