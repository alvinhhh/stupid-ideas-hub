import { useEffect, useMemo, useRef, useState } from 'react';

const THEMES = [
  {
    name: 'morning',
    openers: ['A quiet room', 'The first cup of coffee', 'Soft light on the desk', 'Early trains moving downtown'],
    middles: ['keeps the keyboard warm', 'sets a steady pace', 'makes the next line easier to trust', 'turns small motions into rhythm'],
    closers: ['and the page opens without pressure.', 'while the cursor waits politely.', 'before the day gets noisy.', 'and the words begin to line up.'],
  },
  {
    name: 'build',
    openers: ['A tiny feature', 'One careful release', 'A clean dashboard', 'A better default'],
    middles: ['can save a lot of hidden time', 'should reduce the friction around the edges', 'keeps the team moving without drama', 'turns a rough flow into something calm'],
    closers: ['so the rest of the product feels lighter.', 'and the result is easier to ship.', 'which is usually the whole point.', 'and nobody has to write it twice.'],
  },
  {
    name: 'city',
    openers: ['Late buses drift past', 'Office windows start to glow', 'Rain taps the sidewalk', 'A few lights stay on above the street'],
    middles: ['and the block settles into a slow hum', 'while the sidewalks keep their own pace', 'as the city edits itself in small pieces', 'and every crossing feels a little deliberate'],
    closers: ['until the night becomes almost quiet.', 'before the next stop arrives.', 'and the block holds its breath.', 'while the traffic keeps moving.'],
  },
  {
    name: 'focus',
    openers: ['The sentence gets shorter', 'Attention narrows to one line', 'Hands find a steady cadence', 'The room loses its edges'],
    middles: ['when there is nothing left to rush', 'because the fingers already know the route', 'and the cursor becomes a metronome', 'while each key press stays clean'],
    closers: ['so the test feels almost simple.', 'and the pace stays honest.', 'until the final character lands.', 'without much noise at all.'],
  },
];

const sentenceJoiners = ['and', 'while', 'so', 'because'];

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let index = 0; index < str.length; index += 1) {
    h = Math.imul(h ^ str.charCodeAt(index), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedText) {
  return mulberry32(xmur3(seedText)());
}

function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

function buildSentence(rng) {
  const theme = pick(rng, THEMES);
  const opener = pick(rng, theme.openers);
  const middle = pick(rng, theme.middles);
  const closer = pick(rng, theme.closers);
  const joiner = pick(rng, sentenceJoiners);
  return `${opener} ${middle} ${joiner} ${closer}`;
}

function buildPrompt(seed) {
  const rng = createRng(`${seed}:${Date.now()}`);
  const mode = rng() > 0.45 ? 'paragraph' : 'sentence';
  const sentenceCount = mode === 'paragraph' ? 3 + Math.floor(rng() * 2) : 1;
  const sentences = Array.from({ length: sentenceCount }, () => buildSentence(rng));
  const text = mode === 'paragraph' ? sentences.join(' ') : sentences[0];
  return { text, mode };
}

function normalize(value) {
  return value.replace(/\r/g, '');
}

function analyzeTyping(target, typed, startAt, finishAt, now) {
  const safeTarget = normalize(target);
  const safeTyped = normalize(typed);
  const elapsedMs = startAt ? Math.max(1, (finishAt ?? now) - startAt) : 0;
  let correctChars = 0;
  const typedLength = safeTyped.length;
  const compareLength = Math.min(safeTarget.length, typedLength);

  for (let index = 0; index < compareLength; index += 1) {
    if (safeTarget[index] === safeTyped[index]) {
      correctChars += 1;
    }
  }

  const netWpm = elapsedMs > 0 ? (correctChars / 5) / (elapsedMs / 60000) : 0;
  const grossWpm = elapsedMs > 0 ? (typedLength / 5) / (elapsedMs / 60000) : 0;
  const accuracy = typedLength > 0 ? (correctChars / typedLength) * 100 : 100;
  const complete = safeTyped === safeTarget && safeTyped.length > 0;

  return {
    correctChars,
    typedLength,
    elapsedMs,
    netWpm,
    grossWpm,
    accuracy,
    complete,
  };
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatStat(value, digits = 0) {
  return value.toFixed(digits);
}

export default function App() {
  const [roundSeed, setRoundSeed] = useState(1);
  const [round, setRound] = useState(() => buildPrompt(1));
  const [typed, setTyped] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [roundSeed]);

  useEffect(() => {
    if (!startedAt || finishedAt) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [startedAt, finishedAt]);

  const stats = useMemo(
    () => analyzeTyping(round.text, typed, startedAt, finishedAt, now),
    [round.text, typed, startedAt, finishedAt, now],
  );

  const targetWords = useMemo(() => round.text.split(/\s+/).filter(Boolean).length, [round.text]);
  const typedWords = useMemo(() => typed.trim().split(/\s+/).filter(Boolean).length, [typed]);

  const regenerate = () => {
    const nextSeed = roundSeed + 1;
    setRoundSeed(nextSeed);
    setRound(buildPrompt(nextSeed));
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setNow(Date.now());
  };

  const onChange = (event) => {
    const nextValue = event.target.value;
    if (!startedAt && nextValue.length > 0) {
      setStartedAt(Date.now());
      setNow(Date.now());
    }

    setTyped(nextValue);

    if (finishedAt) {
      return;
    }

    if (normalize(nextValue) === normalize(round.text) && nextValue.length > 0) {
      setFinishedAt(Date.now());
      setNow(Date.now());
    }
  };

  const isComplete = stats.complete;
  const liveWpm = isComplete ? stats.netWpm : stats.netWpm;

  return (
    <main className='app-shell'>
      <section className='hero card paper-card'>
        <div>
          <p className='eyebrow'>typo speed typing</p>
          <h1>Minimal typing test with live speed and accuracy.</h1>
          <p className='lede'>A clean typewriter room with random sentences and paragraphs, accurate timing, and a steady readout as you type.</p>
        </div>
        <div className='hero-stats'>
          <div>
            <span>Mode</span>
            <strong>{round.mode}</strong>
          </div>
          <div>
            <span>Target words</span>
            <strong>{targetWords}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{formatTime(stats.elapsedMs)}</strong>
          </div>
        </div>
      </section>

      <section className='workspace-grid'>
        <section className='card prompt-card paper-card'>
          <div className='section-head'>
            <div>
              <p className='eyebrow'>prompt</p>
              <h2>Type this text</h2>
            </div>
            <p className='meta'>{isComplete ? 'Finished' : 'Typing test in progress'}</p>
          </div>

          <div className='prompt-text' aria-label='typing prompt'>
            {round.text.split('').map((char, index) => {
              let className = 'char';
              const typedChar = typed[index];

              if (index < typed.length) {
                className += typedChar === char ? ' correct' : ' incorrect';
              } else if (index === typed.length) {
                className += ' cursor';
              }

              const displayChar = char === ' ' ? '\u00a0' : char;

              return (
                <span key={`${char}-${index}`} className={className}>
                  {displayChar}
                </span>
              );
            })}
          </div>
        </section>

        <aside className='card stat-panel paper-card'>
          <div className='stat-stack'>
            <div>
              <span>Live WPM</span>
              <strong>{formatStat(liveWpm, 1)}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{formatStat(stats.accuracy, 1)}%</strong>
            </div>
            <div>
              <span>Typed words</span>
              <strong>{typedWords}</strong>
            </div>
            <div>
              <span>Completion</span>
              <strong>{isComplete ? 'done' : 'typing'}</strong>
            </div>
          </div>

          <div className='action-row'>
            <button type='button' onClick={regenerate}>New prompt</button>
            <button type='button' className='secondary' onClick={() => { setTyped(''); setStartedAt(null); setFinishedAt(null); setNow(Date.now()); inputRef.current?.focus(); }}>
              Clear
            </button>
          </div>
        </aside>
      </section>

      <section className='card input-card paper-card'>
        <div className='section-head'>
          <div>
            <p className='eyebrow'>input</p>
            <h2>Typewriter area</h2>
          </div>
          <p className='meta'>Accuracy is measured character by character as you type.</p>
        </div>

        <textarea
          ref={inputRef}
          value={typed}
          onChange={onChange}
          spellCheck='false'
          autoCapitalize='off'
          autoComplete='off'
          autoCorrect='off'
          placeholder='Start typing here'
        />
      </section>
    </main>
  );
}
