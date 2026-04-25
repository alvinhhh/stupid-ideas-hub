import { useMemo, useState } from 'react';

const prompts = [
  'stuck in a last minute reset',
  'polite',
  'send the short version',
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
        <p className='eyebrow'>excuse generator</p>
        <h1>Pick a reason and keep moving.</h1>
        <p className='lede'>A quick spin for the moment when a clean answer matters more than a long one.</p>

        <div className='panel'>
          <div>
            <span>best excuse</span>
            <strong>{value}</strong>
          </div>
          <div>
            <span>tone</span>
            <strong>polite</strong>
          </div>
          <div>
            <span>next move</span>
            <strong>send the short version</strong>
          </div>
        </div>

        <div className='status'>
          <span>mode</span>
          <strong>{mood}</strong>
        </div>

        <button type='button' onClick={next}>spin another excuse</button>
      </section>
    </main>
  );
}
