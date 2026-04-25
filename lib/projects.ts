export type Project = {
  title: string;
  description: string;
  repoUrl: string;
  pagesUrl: string;
  status: 'active' | 'queued';
};

export const projects: Project[] = [
  {
    title: 'Meeting Cost Burner',
    description: 'Shows what each meeting really costs in minutes and money.',
    repoUrl: 'https://github.com/alvinhhh/stupid-ideas-hub/tree/main/projects/meeting-cost-burner',
    pagesUrl: 'projects/meeting-cost-burner/',
    status: 'active',
  },
  {
    title: 'Wiki Faker',
    description: 'A fake wiki page builder for mockups and dry runs.',
    repoUrl: 'https://github.com/alvinhhh/stupid-ideas-hub/tree/main/projects/wiki-faker',
    pagesUrl: 'projects/wiki-faker/',
    status: 'active',
  },
  {
    title: 'Excuse Generator',
    description: 'Fast excuses for when the timing is off.',
    repoUrl: 'https://github.com/alvinhhh/stupid-ideas-hub/tree/main/projects/excuse-generator',
    pagesUrl: 'projects/excuse-generator/',
    status: 'active',
  },
  {
    title: 'text-back-8ball',
    description: 'A pocket-sized text-back toy for turning questions into answers.',
    repoUrl: 'https://github.com/alvinhhh/stupid-ideas-hub/tree/main/projects/text-back-8ball',
    pagesUrl: 'projects/text-back-8ball/',
    status: 'active',
  },
  {
    title: 'not-yet-site',
    description: 'Minimalist scaffold for rapid shipping of new stupid ideas.',
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
