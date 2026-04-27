import { useMemo, useState } from 'react';

const DEFAULT_TEXT = `By using this product, you agree that we may modify, suspend, or discontinue any part of the service at any time without notice. You also agree to mandatory arbitration in Santa Clara County, California, and waive any right to a jury trial or class action. We may collect, store, and analyze your data, including content you submit, device identifiers, and inferred preferences, for internal analytics, product improvement, and commercial use.

We may assign this agreement or any of our rights and obligations at any time without restriction. Any license you grant us is perpetual, irrevocable, worldwide, sublicensable, and transferable. You agree to indemnify, defend, and hold harmless the company from any claim, loss, liability, or expense arising from your use of the service.`;

const RUINOUS_KEYWORDS = [
  { term: 'indemnif', weight: 7 },
  { term: 'arbitration', weight: 7 },
  { term: 'class action', weight: 8 },
  { term: 'jury trial', weight: 6 },
  { term: 'perpetual', weight: 7 },
  { term: 'irrevocable', weight: 7 },
  { term: 'transferable', weight: 4 },
  { term: 'sublicens', weight: 6 },
  { term: 'waive', weight: 5 },
  { term: 'liability', weight: 5 },
  { term: 'disclaim', weight: 5 },
  { term: 'terminate', weight: 4 },
  { term: 'assign', weight: 4 },
  { term: 'collect', weight: 4 },
  { term: 'commercial use', weight: 5 },
  { term: 'without notice', weight: 5 },
  { term: 'any time', weight: 3 },
  { term: 'broad', weight: 2 },
  { term: 'exclusive', weight: 2 },
  { term: 'royalty-free', weight: 4 },
  { term: 'license', weight: 3 },
  { term: 'government', weight: 2 },
  { term: 'content you submit', weight: 4 },
  { term: 'third party', weight: 2 },
  { term: 'no warranty', weight: 5 },
];

const EFFECT_WORDS = ['indemnify', 'arbitrate', 'waive', 'transfer', 'license', 'collect', 'discontinue', 'terminate', 'sublicense'];

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function scoreSentence(sentence) {
  const lower = sentence.toLowerCase();
  let score = 0;
  const hits = [];

  for (const entry of RUINOUS_KEYWORDS) {
    if (lower.includes(entry.term)) {
      score += entry.weight;
      hits.push(entry.term);
    }
  }

  for (const word of EFFECT_WORDS) {
    if (lower.includes(word)) {
      score += 1;
    }
  }

  if (lower.includes('any') && lower.includes('rights')) {
    score += 2;
  }

  if (lower.includes('without')) {
    score += 1;
  }

  if (sentence.length > 180) {
    score += 2;
  } else if (sentence.length > 120) {
    score += 1;
  }

  return {
    sentence,
    score,
    hits,
  };
}

function analyzeText(text) {
  const sentences = splitSentences(text);
  const scored = sentences.map(scoreSentence).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.sentence.length - a.sentence.length;
  });

  return scored.slice(0, 3);
}

function formatHits(hits) {
  if (hits.length === 0) {
    return 'general risk language';
  }

  const unique = [...new Set(hits)];
  return unique.slice(0, 4).join(', ');
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_TEXT);
  const [results, setResults] = useState(() => analyzeText(DEFAULT_TEXT));

  const sentenceCount = useMemo(() => splitSentences(input).length, [input]);
  const keywordHits = useMemo(() => {
    const lower = input.toLowerCase();
    return RUINOUS_KEYWORDS.filter((item) => lower.includes(item.term)).length;
  }, [input]);

  const analyze = () => {
    setResults(analyzeText(input));
  };

  return (
    <main className='shell'>
      <section className='hero card paper-card'>
        <div>
          <p className='eyebrow'>terms and conditions review</p>
          <h1>Paste a policy, surface the 3 most ruinous sentences.</h1>
          <p className='lede'>This scanner ranks clauses by legal pain points like indemnity, arbitration, perpetual rights, and broad data use.</p>
        </div>
        <div className='stats-grid'>
          <div>
            <span>Sentences</span>
            <strong>{sentenceCount}</strong>
          </div>
          <div>
            <span>Keyword hits</span>
            <strong>{keywordHits}</strong>
          </div>
          <div>
            <span>Output</span>
            <strong>Top 3</strong>
          </div>
        </div>
      </section>

      <section className='card editor-card paper-card'>
        <div className='section-head'>
          <div>
            <p className='eyebrow'>source text</p>
            <h2>Terms input</h2>
          </div>
          <p className='meta'>Paste contract text below, then review the extracted clauses.</p>
        </div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck='false' />
        <div className='actions'>
          <button type='button' onClick={analyze}>Analyze terms</button>
          <button type='button' className='secondary' onClick={() => { setInput(DEFAULT_TEXT); setResults(analyzeText(DEFAULT_TEXT)); }}>Load sample</button>
        </div>
      </section>

      <section className='card results-card paper-card'>
        <div className='section-head'>
          <div>
            <p className='eyebrow'>results</p>
            <h2>3 most ruinous sentences</h2>
          </div>
          <p className='meta'>Ranked by keyword intensity and clause weight.</p>
        </div>

        {results.length === 0 ? (
          <p className='empty-state'>No analysis yet. Paste text and analyze it.</p>
        ) : (
          <ol className='ruin-list'>
            {results.map((item) => (
              <li key={item.sentence} className='ruin-item'>
                <div className='ruin-copy'>{item.sentence}</div>
                <div className='ruin-meta'>
                  <span>Score {item.score}</span>
                  <span>{formatHits(item.hits)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
