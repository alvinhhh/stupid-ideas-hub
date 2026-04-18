import { useMemo, useState } from 'react';

const openers = [
  'We are building',
  'This unlocks',
  'The platform creates',
  'Our wedge is',
  'We see a massive opportunity in',
];

const modifiers = [
  'AI-native',
  'hyper-scalable',
  'verticalized',
  'distribution-first',
  'revenue-generating',
  'founder-friendly',
  'category-defining',
];

const nouns = [
  'workflow orchestration',
  'customer obsession',
  'go-to-market leverage',
  'network effects',
  'operating leverage',
  'category ownership',
  'platform velocity',
];

const verbs = [
  'accelerate',
  'compound',
  'unlock',
  'de-risk',
  'optimize',
  'monetize',
  'transform',
];

const closers = [
  'This is not a feature, it is infrastructure.',
  'The market is already asking for this.',
  'We are compounding distribution every week.',
  'It is early, but the signal is obvious.',
  'This is where the category gets redefined.',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateLine() {
  return pick(openers) + ' ' + pick(modifiers) + ' ' + pick(nouns) + ' to ' + pick(verbs) + ' growth.';
}

function generatePitchIpsum() {
  return [generateLine(), generateLine(), generateLine(), pick(closers)].join('\n\n');
}

export default function App() {
  const [copyState, setCopyState] = useState('');
  const [copyBuffer, setCopyBuffer] = useState(() => generatePitchIpsum());

  const wordCount = useMemo(() => copyBuffer.split(/\s+/).filter(Boolean).length, [copyBuffer]);

  const regenerate = () => {
    setCopyBuffer(generatePitchIpsum());
    setCopyState('');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(copyBuffer);
    setCopyState('Copied to clipboard');
  };

  return (
    <main className='app shell'>
      <section className='hero card'>
        <p className='eyebrow'>pitch ipsum</p>
        <h1>Buzzword-heavy Lorem Ipsum for startup decks.</h1>
        <p className='lede'>Generate paragraphs that sound like a founder update, a pitch memo, or a product strategy slide.</p>
        <div className='actions'>
          <button onClick={regenerate}>Generate another</button>
          <button className='secondary' onClick={copy}>Copy text</button>
        </div>
        <p className='meta'>{wordCount} words {copyState ? '• ' + copyState : ''}</p>
      </section>

      <section className='card output'>
        <pre>{copyBuffer}</pre>
      </section>
    </main>
  );
}
