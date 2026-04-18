import { projects } from '../lib/projects';

function Badge({ status }: { status: string }) {
  return <span className={status === 'active' ? 'badge badge-active' : 'badge'}>{status}</span>;
}

export default function Home() {
  return (
    <main className='mx-auto min-h-screen max-w-6xl px-6 py-12 text-slate-100 sm:px-8 lg:px-10'>
      <section className='relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-glow backdrop-blur'>
        <div className='absolute inset-0 bg-grid-fade bg-[size:28px_28px] opacity-20' />
        <div className='relative z-10 flex flex-col gap-8'>
          <div className='max-w-3xl'>
            <p className='text-xs uppercase tracking-[0.35em] text-cyan-300'>stupid ideas hub</p>
            <h1 className='mt-4 text-4xl font-semibold tracking-tight sm:text-5xl'>
              A clean catalog for the drip-fed project queue.
            </h1>
            <p className='mt-4 max-w-2xl text-base leading-7 text-slate-300'>
              Central homepage for the growing collection of small, intentionally weird projects. Each card links to the source repo and the hosted page.
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {projects.map((project) => (
              <article key={project.title} className='group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-white/10'>
                <div className='flex items-center justify-between gap-3'>
                  <h2 className='text-xl font-semibold'>{project.title}</h2>
                  <Badge status={project.status} />
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-300'>{project.description}</p>
                <div className='mt-5 flex flex-wrap gap-3 text-sm'>
                  <a className='rounded-full border border-white/10 px-3 py-1.5 transition hover:border-cyan-400/60 hover:text-cyan-200' href={project.repoUrl} target='_blank' rel='noreferrer'>
                    GitHub
                  </a>
                  <a className='rounded-full border border-white/10 px-3 py-1.5 transition hover:border-cyan-400/60 hover:text-cyan-200' href={project.pagesUrl} target='_blank' rel='noreferrer'>
                    GitHub Pages
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
