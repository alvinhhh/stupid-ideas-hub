import { useMemo, useState } from 'react';

const prompts = [
  'type fast and keep it clean',
  'small hands, quick keys',
  'the fastest word wins',
  'keep the words small and the hands moving',
  'focus on the flow',
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [text, setText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);

  const prompt = prompts[promptIndex % prompts.length];
  const cleanText = text.trim().toLowerCase();
  const cleanPrompt = prompt.toLowerCase();
  const match = cleanText === cleanPrompt;

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [text]);

  const nextRound = () => {
    setStarted(true);
    setText('');
    setPromptIndex((value) => value + 1);
  };

  return (
    <main className='shell'>
      <section className='card'>
        <p className='eyebrow'>typo speed typing</p>
        <h1>Typo Speed Typing</h1>
        <p className='lede'>A simple typing room. One prompt, one input, one clean finish, no clutter.</p>

        <div className='prompt-box'>
          <span>Prompt</span>
          <strong>{prompt}</strong>
        </div>

        <label className='input-wrap'>
          <span>Type it here</span>
          <input
            autoComplete='off'
            spellCheck='false'
            value={text}
            onChange={(event) => {
              setStarted(true);
              setText(event.target.value);
            }}
            placeholder='start typing'
          />
        </label>

        <div className='row'>
          <div>
            <span>Status</span>
            <strong>{match ? 'done' : started ? 'keep going' : 'waiting'}</strong>
          </div>
          <div>
            <span>Chars</span>
            <strong>{stats.chars}</strong>
          </div>
          <div>
            <span>Words</span>
            <strong>{stats.words}</strong>
          </div>
        </div>

        <button onClick={nextRound}>{match ? 'Next prompt' : 'Skip prompt'}</button>
      </section>
    </main>
  );
}
