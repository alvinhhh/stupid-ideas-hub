import { useMemo, useState } from 'react';

const VIBES = {
  saas: {
    label: 'SaaS',
    palette: ['workflow', 'retention', 'automation', 'pipeline', 'ops'],
    nouns: ['workflow engine', 'dashboard layer', 'billing surface', 'team workspace', 'admin console', 'account system'],
    verbs: ['reduce', 'streamline', 'compress', 'instrument', 'unlock', 'standardize'],
    outcomes: ['cycle time', 'manual work', 'handoffs', 'setup time', 'support load', 'churn risk'],
    markets: ['operations teams', 'small businesses', 'distributed teams', 'customer success orgs', 'revops leads', 'finance teams'],
    metrics: ['MRR', 'retention', 'activation', 'expansion', 'conversion', 'payback period'],
    tone: ['practical', 'measurable', 'systematic', 'high-signal', 'operator-first'],
  },
  model: {
    label: 'Model',
    palette: ['prediction', 'reasoning', 'signal', 'assist', 'scoring'],
    nouns: ['decision layer', 'ranking engine', 'assistant surface', 'analysis stack', 'signal graph', 'inference loop'],
    verbs: ['interpret', 'predict', 'surface', 'score', 'summarize', 'prioritize'],
    outcomes: ['false positives', 'review time', 'latency', 'noise', 'manual triage', 'ambiguity'],
    markets: ['research teams', 'support teams', 'operators', 'analysts', 'reviewers', 'builders'],
    metrics: ['precision', 'recall', 'latency', 'throughput', 'quality', 'coverage'],
    tone: ['sharp', 'speculative', 'technical', 'adaptive', 'evidence-led'],
  },
  crypto: {
    label: 'Crypto',
    palette: ['onchain', 'liquidity', 'wallet', 'protocol', 'market'],
    nouns: ['liquidity rail', 'wallet layer', 'protocol surface', 'settlement path', 'token flow', 'vault system'],
    verbs: ['route', 'settle', 'coordinate', 'buffer', 'secure', 'compose'],
    outcomes: ['friction', 'fragmentation', 'slippage', 'trust gaps', 'manual reconciliation', 'idle capital'],
    markets: ['traders', 'builders', 'communities', 'power users', 'treasury teams', 'operators'],
    metrics: ['volume', 'velocity', 'retention', 'liquidity', 'fees', 'activity'],
    tone: ['composable', 'open', 'liquid', 'networked', 'permissionless'],
  },
  marketplace: {
    label: 'Marketplace',
    palette: ['supply', 'demand', 'trust', 'liquidity', 'matching'],
    nouns: ['matching engine', 'trust layer', 'listing flow', 'supply graph', 'booking system', 'conversion loop'],
    verbs: ['match', 'route', 'increase', 'deepen', 'activate', 'smooth'],
    outcomes: ['friction', 'dropoff', 'idle inventory', 'search time', 'trust gaps', 'missed conversions'],
    markets: ['buyers', 'sellers', 'hosts', 'renters', 'service providers', 'operators'],
    metrics: ['fill rate', 'take rate', 'conversion', 'liquidity', 'repeat usage', 'GMV'],
    tone: ['balanced', 'market-aware', 'liquid', 'trust-centric', 'two-sided'],
  },
  fintech: {
    label: 'Fintech',
    palette: ['compliance', 'payments', 'risk', 'settlement', 'credit'],
    nouns: ['ledger layer', 'risk engine', 'payment stack', 'cash flow view', 'treasury surface', 'controls layer'],
    verbs: ['clear', 'verify', 'route', 'protect', 'reconcile', 'underwrite'],
    outcomes: ['delays', 'exceptions', 'manual review', 'failed payments', 'reconciliation drift', 'risk exposure'],
    markets: ['finance teams', 'operators', 'SMBs', 'platforms', 'merchants', 'back offices'],
    metrics: ['approval rate', 'loss rate', 'recovery', 'cash conversion', 'volume', 'margin'],
    tone: ['trustworthy', 'compliant', 'precise', 'calculated', 'operational'],
  },
};

const vibeKeys = Object.keys(VIBES);

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

function createGenerator(seedText) {
  return mulberry32(xmur3(seedText)());
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function pickMany(rng, list, count) {
  const pool = [...list];
  const result = [];
  while (pool.length && result.length < count) {
    const index = Math.floor(rng() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function titleCase(value) {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function sentenceJoin(parts) {
  return parts.filter(Boolean).join(' ');
}

function makeParagraph(vibeKey, rng, paragraphIndex, paragraphCount) {
  const vibe = VIBES[vibeKey];
  const tone = pick(rng, vibe.tone);
  const nouns = pickMany(rng, vibe.nouns, 2);
  const metricA = pick(rng, vibe.metrics);
  const metricB = pick(rng, vibe.metrics.filter((item) => item !== metricA));
  const market = pick(rng, vibe.markets);
  const outcome = pick(rng, vibe.outcomes);
  const verbA = pick(rng, vibe.verbs);
  const verbB = pick(rng, vibe.verbs.filter((item) => item !== verbA));
  const focus = pick(rng, vibe.palette);

  const openers = [
    'We are building a ' + tone + ' ' + nouns[0] + ' around ' + focus + '.',
    'The product starts with ' + market + ' and uses a ' + nouns[0] + ' to ' + verbA + ' the entire motion.',
    'Our wedge is simple: take the ' + nouns[0] + ' and make it feel like a default operating layer.',
    'There is a clear reason this works for ' + market + ': the current process leaves too much ' + outcome + '.',
  ];

  const middle = [
    'It should ' + verbA + ' ' + outcome + ' while making ' + metricA + ' and ' + metricB + ' easier to track in one place.',
    'That gives teams a cleaner path from first touch to repeat usage without adding more manual steps.',
    'The real value is not the surface feature, it is the repeatable system behind it.',
    'Every interaction feeds the next one, which keeps the loop tighter and the signal stronger.',
  ];

  const secondMiddle = [
    'In practice, the workflow stays lightweight, but the underlying structure keeps getting sharper as usage grows.',
    'The result is a product that feels focused for users and durable for the business.',
    'That is why the team can keep shipping without rethinking the entire stack each time the market changes.',
    'We want the product to do the hard part quietly so the customer only sees momentum.',
  ];

  const closers = [
    'This is about ' + titleCase(focus) + ' that compounds instead of resets every quarter.',
    'The plan is to turn that into better ' + metricA + ', better ' + metricB + ', and a cleaner path to distribution.',
    'By the end of the loop, the product should feel obvious, not experimental.',
    'That is the kind of leverage that makes the next paragraph easier to believe.',
  ];

  const paragraphTypes = [
    sentenceJoin([pick(rng, openers), pick(rng, middle), pick(rng, secondMiddle)]),
    sentenceJoin([pick(rng, openers), pick(rng, middle), pick(rng, closers)]),
    sentenceJoin([pick(rng, openers), pick(rng, middle), pick(rng, secondMiddle), pick(rng, closers)]),
  ];

  if (paragraphIndex === 0) {
    return sentenceJoin([
      'We are building a ' + tone + ' ' + nouns[0] + ' for ' + market + '.',
      'It is designed to ' + verbA + ' ' + outcome + ' and make ' + metricA + ' feel like a core product property.',
      'The thesis is that a tighter ' + nouns[1] + ' turns the entire funnel into something more legible.',
    ]);
  }

  if (paragraphIndex === paragraphCount - 1) {
    return sentenceJoin([
      'The business case is straightforward: stronger ' + metricA + ', better ' + metricB + ', and less ' + outcome + '.',
      'If we can keep the loop tight, the product becomes easier to explain and easier to sell.',
      'That is the kind of leverage we want before the next stage of growth.',
    ]);
  }

  return paragraphTypes[Math.floor(rng() * paragraphTypes.length)];
}

function generatePitch({ vibeKey, paragraphs, seed }) {
  const rng = createGenerator(vibeKey + ':' + paragraphs + ':' + seed);
  const blocks = [];

  for (let index = 0; index < paragraphs; index += 1) {
    blocks.push(makeParagraph(vibeKey, rng, index, paragraphs));
  }

  return blocks.join('\n\n');
}

function createSeed() {
  return Math.floor(Date.now() % 1000000000);
}

export default function App() {
  const [vibeKey, setVibeKey] = useState('saas');
  const [paragraphs, setParagraphs] = useState(3);
  const [seed, setSeed] = useState(() => createSeed());
  const [copyState, setCopyState] = useState('');

  const pitchText = useMemo(
    () => generatePitch({ vibeKey, paragraphs, seed }),
    [vibeKey, paragraphs, seed],
  );

  const wordCount = useMemo(() => pitchText.split(/\s+/).filter(Boolean).length, [pitchText]);

  const vibeLabel = VIBES[vibeKey].label;

  const regenerate = () => {
    setSeed(createSeed());
    setCopyState('');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pitchText);
      setCopyState('Copied to clipboard');
    } catch {
      setCopyState('Copy failed');
    }
  };

  return (
    <main className='app-shell'>
      <section className='hero card'>
        <div>
          <p className='eyebrow'>pitch ipsum</p>
          <h1>Procedural startup jargon, tuned by vibe.</h1>
          <p className='lede'>Generate multi-paragraph pitch copy that feels closer to a founder memo, a deck, or a market thesis.</p>
        </div>
        <div className='hero-stats'>
          <div>
            <span>Vibe</span>
            <strong>{vibeLabel}</strong>
          </div>
          <div>
            <span>Paragraphs</span>
            <strong>{paragraphs}</strong>
          </div>
          <div>
            <span>Words</span>
            <strong>{wordCount}</strong>
          </div>
        </div>
      </section>

      <section className='controls card'>
        <label>
          <span>Startup vibe</span>
          <select value={vibeKey} onChange={(event) => setVibeKey(event.target.value)}>
            {vibeKeys.map((key) => (
              <option key={key} value={key}>
                {VIBES[key].label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Paragraphs</span>
          <input
            type='range'
            min='2'
            max='5'
            step='1'
            value={paragraphs}
            onChange={(event) => setParagraphs(Number(event.target.value))}
          />
          <strong>{paragraphs}</strong>
        </label>

        <div className='action-row'>
          <button type='button' onClick={regenerate}>Generate new copy</button>
          <button type='button' className='secondary' onClick={copy}>Copy text</button>
        </div>
      </section>

      <section className='output card'>
        <div className='output-head'>
          <div>
            <p className='eyebrow'>output</p>
            <h2>{titleCase(vibeLabel)} pitch</h2>
          </div>
          <p className='meta'>{copyState || 'Ready to use.'}</p>
        </div>

        <div className='copy-block'>
          {pitchText.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
