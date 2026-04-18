import { projects } from '../lib/projects';

function Badge({ status }: { status: string }) {
  return <span className={status === 'active' ? 'badge badge-active' : 'badge'}>{status}</span>;
}

export default function Home() {
  return (
    <main className='hub-shell'>
      <header className='hub-header'>
        <p className='eyebrow'>stupid ideas hub</p>
        <h1>Stupid Ideas Catalog</h1>
        <p className='lede'>Plain build. Each project lives under /projects/name/.</p>
      </header>

      <section className='project-grid'>
        {projects.map((project) => (
          <article key={project.title} className='project-card'>
            <div className='project-head'>
              <h2>{project.title}</h2>
              <Badge status={project.status} />
            </div>
            <p className='project-desc'>{project.description}</p>
            <div className='project-links'>
              <a className='chip' href={project.repoUrl} target='_blank' rel='noreferrer'>
                GitHub
              </a>
              <a className='chip' href={project.pagesUrl}>
                Open project
              </a>
            </div>
          </article>
        ))}
      </section>

      <footer className='plain-footer'>
        <a href='https://alvinhua.ng' target='_blank' rel='noreferrer'>alvinhua.ng</a>
      </footer>
    </main>
  );
}
