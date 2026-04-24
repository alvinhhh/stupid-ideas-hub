import { useMemo, useState } from 'react';

const responses = [
  'Reply now.',
  'Give it ten minutes.',
  'Send the clean version.',
  'Short answer: yes.',
  'Short answer: no.',
  'Wait for the next window.',
  'The timing is good.',
  'The timing is not good.',
  'Ask again with fewer words.',
];

const prompts = [
  'Should I text back?',
  'Is this the right move?',
  'Do we ship it today?',
  'Is the answer obvious?',
];

export default function App() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [responseIndex, setResponseIndex] = useState(0);

  const prompt = prompts[promptIndex];
  const response = responses[responseIndex];

  const status = useMemo(() => {
    if (responseIndex % 3 === 0) return 'confident';
    if (responseIndex % 3 === 1) return 'cautious';
    return 'playful';
  }, [responseIndex]);

  function askAgain() {
    setPromptIndex((current) => (current + 1) % prompts.length);
    setResponseIndex((current) => (current + 1) % responses.length);
  }

  return (
    <main className='shell'>
      <section className='card'>
        <p className='eyebrow'>text back 8ball</p>
        <h1>Fast answers for slow decisions.</h1>
        <p className='lede'>Tap once, get a direct response, and keep moving.</p>

        <div className='orb'>
          <span className='orb-label'>current prompt</span>
          <strong>{prompt}</strong>
          <span className='orb-answer'>{response}</span>
        </div>

        <div className='panel'>
          <div>
            <span>mood</span>
            <strong>{status}</strong>
          </div>
          <div>
            <span>signal</span>
            <strong>one tap</strong>
          </div>
          <div>
            <span>next move</span>
            <strong>ask again</strong>
          </div>
        </div>

        <button type='button' onClick={askAgain}>shake the phone</button>
      </section>
    </main>
  );
}
