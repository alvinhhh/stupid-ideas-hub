import { useMemo, useState } from 'react';

const prompts = [
  'Project Atlas',
  'draft',
  'placeholder notes',
];

export default function App() {
  const [index, setIndex] = useState(0);
  const value = prompts[index];

  const mood = useMemo(() => {
    if (index === 0) return 'steady';
    if (index === 1) return 'warm';
    return 'fast';
  }, [index]);

  function next() {
    setIndex((current) => (current + 1) % prompts.length);
  }

  return (
    <main className='shell'>
      <section className='card'>
        <p className='eyebrow'>wiki faker</p>
        <h1>Looks like a page, feels like a page.</h1>
        <p className='lede'>Useful for demos, screenshots, and anything that needs a believable reference fast.</p>

        <div className='panel'>
          <div>
            <span>page title</span>
            <strong>{value}</strong>
          </div>
          <div>
            <span>status</span>
            <strong>draft</strong>
          </div>
          <div>
            <span>source</span>
            <strong>placeholder notes</strong>
          </div>
        </div>

        <div className='status'>
          <span>mode</span>
          <strong>{mood}</strong>
        </div>

        <button type='button' onClick={next}>swap entry</button>
      </section>
    </main>
  );
}
