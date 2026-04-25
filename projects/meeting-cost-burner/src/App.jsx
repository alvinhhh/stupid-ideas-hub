import { useMemo, useState } from 'react';

const prompts = [
  '$84',
  '6',
  '30 min',
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
        <p className='eyebrow'>meeting cost burner</p>
        <h1>Every extra minute has a number.</h1>
        <p className='lede'>A tiny dashboard for turning meeting time into something you can feel.</p>

        <div className='panel'>
          <div>
            <span>current burn</span>
            <strong>{value}</strong>
          </div>
          <div>
            <span>attendees</span>
            <strong>6</strong>
          </div>
          <div>
            <span>time</span>
            <strong>30 min</strong>
          </div>
        </div>

        <div className='status'>
          <span>mode</span>
          <strong>{mood}</strong>
        </div>

        <button type='button' onClick={next}>add five minutes</button>
      </section>
    </main>
  );
}
