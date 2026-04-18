import { useMemo, useState } from "react";
import { buildRejectionEmail } from "./rejection";

export default function App() {
  const [clickCount, setClickCount] = useState(0);
  const [emailIndex, setEmailIndex] = useState(0);
  const [totalRejections, setTotalRejections] = useState(0);

  const currentEmail = useMemo(() => buildRejectionEmail(emailIndex), [emailIndex]);

  const handleClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    setTotalRejections((value) => value + 1);
    setEmailIndex(nextCount);
  };

  const reset = () => {
    setClickCount(0);
    setEmailIndex(0);
    setTotalRejections(0);
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">vc rejection clicker</p>
        <h1>Every click summons a fresh rejection email.</h1>
        <p className="lede">
          Clean, idiomatic React and TypeScript with a simple click loop, unique rejection copy, and a clear path for future scoring.
        </p>

        <div className="stats">
          <div>
            <span>Clicks</span>
            <strong>{clickCount}</strong>
          </div>
          <div>
            <span>Rejections</span>
            <strong>{totalRejections}</strong>
          </div>
        </div>

        <div className="actions">
          <button onClick={handleClick}>Generate rejection</button>
          <button className="secondary" onClick={reset}>Reset</button>
        </div>
      </section>

      <section className="email-card">
        <div className="email-header">
          <span>Subject</span>
          <strong>{currentEmail.subject}</strong>
        </div>
        <pre>{currentEmail.body}</pre>
      </section>
    </main>
  );
}
