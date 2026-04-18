import { useMemo, useState } from 'react';

const defaultText = `By using this product, you agree that we may modify, suspend, or discontinue any part of the service at any time without notice. You also agree to a mandatory arbitration process in Santa Clara County, California, and waive any right to a jury trial or class action. We may collect, store, and analyze your data, including content you submit, device identifiers, and inferred preferences, for internal analytics, product improvement, and commercial use.

This is a placeholder while the LLM integration is wired up.`;

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
}

function pickDangerousSentences(sentences) {
  return [...sentences]
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);
}

export default function App() {
  const [input, setInput] = useState(defaultText);
  const [result, setResult] = useState([]);

  const sentenceCount = useMemo(() => splitSentences(input).length, [input]);

  const analyze = () => {
    const sentences = splitSentences(input);
    setResult(pickDangerousSentences(sentences));
  };

  return (
    <main className='app shell'>
      <section className='hero card'>
        <p className='eyebrow'>tc life ruiner</p>
        <h1>Paste terms and conditions. Surface the three most dangerous sentences.</h1>
        <p className='lede'>The LLM integration will slot into this flow; the current build keeps the interface and review path in place.</p>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <div className='actions'>
          <button onClick={analyze}>Find the worst 3</button>
          <span className='meta'>{sentenceCount} sentences detected</span>
        </div>
      </section>

      <section className='card output'>
        <h2>Highlighted sentences</h2>
        {result.length === 0 ? (
          <p className='lede'>No analysis yet.</p>
        ) : (
          <ol>{result.map((sentence) => <li key={sentence}>{sentence}</li>)}</ol>
        )}
      </section>
    </main>
  );
}
