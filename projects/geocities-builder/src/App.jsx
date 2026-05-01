import { useMemo, useState } from 'react';

const CONSTRUCTION_ICONS = [
  svgData('#ffcc00', '#1e1e1e', 'UNDER CONSTRUCTION'),
  svgData('#ff6666', '#ffffff', 'NEW HOT SPOT'),
  svgData('#66ddff', '#000000', 'CLICK HERE'),
];

function svgData(bg, fg, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="120" viewBox="0 0 180 120">
      <rect width="180" height="120" rx="14" fill="${bg}"/>
      <rect x="10" y="10" width="160" height="100" rx="12" fill="#fff8dc" stroke="#111" stroke-width="4" stroke-dasharray="10 6"/>
      <g fill="${fg}" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" text-anchor="middle">
        <text x="90" y="38" font-size="18" font-weight="700">UNDER</text>
        <text x="90" y="62" font-size="18" font-weight="700">CONSTRUCTION</text>
        <text x="90" y="90" font-size="16">${label}</text>
      </g>
      <path d="M22 96H158" stroke="#111" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 104l18-30 18 30" fill="none" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
      <path d="M116 104l18-30 18 30" fill="none" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function paragraphsFromText(text) {
  return text
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.replace(/\n/g, ' '));
}

function createPreviewHtml({ title, marquee, accent, bg, text }) {
  const paragraphs = paragraphsFromText(text);
  const sectionHtml = paragraphs.length
    ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
    : '<p>Start typing to fill this page with glitter, links, and loud design choices.</p>';

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
        color: #111;
        background:
          radial-gradient(circle at 12px 12px, rgba(255,255,255,0.26) 1px, transparent 1px) 0 0 / 84px 84px,
          radial-gradient(circle at 56px 44px, rgba(255,215,0,0.24) 1px, transparent 1px) 0 0 / 120px 120px,
          linear-gradient(180deg, ${bg} 0%, #111a45 100%);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 12px 12px, rgba(255,255,255,0.26) 1px, transparent 1px) 0 0 / 84px 84px,
          radial-gradient(circle at 56px 44px, rgba(255,215,0,0.24) 1px, transparent 1px) 0 0 / 120px 120px,
          linear-gradient(180deg, ${bg} 0%, #111a45 100%);
        padding: 16px;
      }
      marquee {
        color: #fff;
        background: linear-gradient(90deg, ${accent}, #ffe86b, ${accent});
        border: 4px ridge #fff;
        padding: 0.25rem 0;
        font-weight: 700;
      }
      .page {
        max-width: 980px;
        margin: 0 auto;
        background: rgba(255,255,255,0.95);
        border: 6px ridge #fff;
        box-shadow: 0 16px 35px rgba(0,0,0,0.25);
        overflow: hidden;
      }
      .hero {
        padding: 18px;
        text-align: center;
        border-bottom: 6px double ${accent};
        background: linear-gradient(180deg, #fff8f3, #fff);
      }
      h1 {
        margin: 0;
        font-size: clamp(2rem, 5vw, 4.3rem);
        text-shadow: 2px 2px 0 ${accent};
      }
      .flex {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 18px;
        padding: 18px;
      }
      .box {
        border: 4px ridge #d6d6d6;
        background: #fffff8;
        padding: 14px;
      }
      .box h2 {
        margin: 0 0 10px;
        text-align: center;
        background: ${accent};
        color: #fff;
        padding: 6px;
      }
      p {
        margin: 0 0 0.9rem;
        line-height: 1.55;
      }
      .icons {
        display: grid;
        gap: 12px;
        justify-items: center;
      }
      .icons img {
        width: 180px;
        height: 120px;
        border: 3px groove #444;
        transform-origin: center;
        animation: wobble 4s linear infinite;
        background: #fff;
      }
      .icons img:nth-child(2) { animation-duration: 5s; }
      .icons img:nth-child(3) { animation-duration: 6s; }
      .button-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 12px;
      }
      .button-row a {
        display: inline-block;
        padding: 10px 14px;
        background: #ffe86b;
        border: 3px outset #fff;
        color: #111;
        text-decoration: none;
        font-weight: 700;
      }
      .guestbook {
        border-top: 4px double ${accent};
        padding: 18px;
        background: linear-gradient(180deg, #fff, #fff8dc);
      }
      .guestbook form {
        display: grid;
        gap: 10px;
      }
      .guestbook textarea,
      .guestbook input {
        width: 100%;
        border: 3px inset #b9b9b9;
        padding: 10px;
        background: #fffef7;
      }
      .guestbook button {
        justify-self: start;
        border: 3px ridge #ccc;
        background: linear-gradient(180deg, #fff 0%, #ddd 100%);
        padding: 10px 14px;
      }
      .footer {
        padding: 14px;
        border-top: 4px ridge #ccc;
        text-align: center;
        background: #f5f5f5;
      }
      .footer a { color: #0b52ff; }
      .cursor {
        animation: blink 1s steps(2, end) infinite;
      }
      @keyframes blink {
        50% { opacity: 0; }
      }
      @keyframes wobble {
        0% { transform: rotate(-2deg) scale(1); }
        25% { transform: rotate(2deg) scale(1.03); }
        50% { transform: rotate(-1deg) scale(1); }
        75% { transform: rotate(1deg) scale(1.03); }
        100% { transform: rotate(-2deg) scale(1); }
      }
      @media (max-width: 760px) {
        .flex { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <marquee behavior="alternate" scrollamount="8">${escapeHtml(marquee)} :: ${escapeHtml(title)}</marquee>
      <section class="hero">
        <h1>${escapeHtml(title)}</h1>
        <div class="cursor">&lt;3</div>
      </section>
      <section class="flex">
        <article class="box">
          <h2>Welcome</h2>
          ${sectionHtml}
          <div class="button-row">
            <a href="#">home</a>
            <a href="#">guestbook</a>
            <a href="#">links</a>
          </div>
        </article>
        <aside class="box">
          <h2>Under Construction</h2>
          <div class="icons">
            <img src="${CONSTRUCTION_ICONS[0]}" alt="Under construction sign 1" />
            <img src="${CONSTRUCTION_ICONS[1]}" alt="Under construction sign 2" />
            <img src="${CONSTRUCTION_ICONS[2]}" alt="Under construction sign 3" />
          </div>
        </aside>
      </section>
      <section class="guestbook">
        <h2>Guestbook</h2>
        <form>
          <input type="text" value="Name your visitor" />
          <textarea rows="4">${escapeHtml(paragraphs[0] || text)}</textarea>
          <button type="button">Sign guestbook</button>
        </form>
      </section>
      <div class="footer">
        <marquee scrollamount="5">Thanks for stopping by. Come back soon.</marquee>
        <p><a href="https://alvinhua.ng" target="_blank" rel="noreferrer">alvinhua.ng</a></p>
      </div>
    </div>
  </body>
</html>`;
}

export default function App() {
  const [title, setTitle] = useState('My Awesome Zone');
  const [marquee, setMarquee] = useState('Welcome to my corner of the web');
  const [accent, setAccent] = useState('#ff66cc');
  const [bg, setBg] = useState('#123d79');
  const [text, setText] = useState(
    'Type your site copy here. Use short lines, loud claims, and a little chaos. Blank lines make new sections appear in the preview.',
  );

  const previewHtml = useMemo(
    () => createPreviewHtml({ title, marquee, accent, bg, text }),
    [title, marquee, accent, bg, text],
  );

  const randomize = () => {
    const picks = [
      {
        title: 'My Sparkly Web Den',
        marquee: 'You have entered a neon miracle',
        bg: '#5c1a47',
        accent: '#63ffdf',
        text: 'This page loves sparkles, blinking text, and dramatic opinions.\n\nDrop your own copy here and make the internet feel personal again.',
      },
      {
        title: 'Retro Startup Shrine',
        marquee: 'Investors, lurkers, and curious friends all welcome',
        bg: '#1f5e3b',
        accent: '#ffe86b',
        text: 'Tell the story. Make it loud. Use a few paragraphs and a little too much confidence.\n\nA guestbook always makes it better.',
      },
      {
        title: 'Chaos Garden',
        marquee: 'Everything is under construction forever',
        bg: '#5b3a17',
        accent: '#ff77aa',
        text: 'The tiled stars are non negotiable. The marquee is mandatory.\n\nIf the page feels a little over the top, you are doing it right.',
      },
    ];
    const pick = picks[Math.floor(Math.random() * picks.length)];
    setTitle(pick.title);
    setMarquee(pick.marquee);
    setBg(pick.bg);
    setAccent(pick.accent);
    setText(pick.text);
  };

  return (
    <div className='shell'>
      <div className='banner'>
        <marquee behavior='alternate' scrollamount='7'>
          Geocities Builder :: make your page loud, shiny, and a little too proud
        </marquee>
      </div>
      <main className='workspace'>
        <section className='panel'>
          <h1>Geocities Builder</h1>
          <p className='lede'>Paste your text, pick a mood, and preview a glorious retro web page.</p>
          <div className='field-grid'>
            <label className='field'>
              <span>Page title</span>
              <input type='text' value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className='field'>
              <span>Marquee text</span>
              <input type='text' value={marquee} onChange={(event) => setMarquee(event.target.value)} />
            </label>
            <label className='field'>
              <span>Body text</span>
              <textarea value={text} onChange={(event) => setText(event.target.value)} />
            </label>
            <div className='control-row'>
              <label className='field' style={{ flex: 1, minWidth: 180 }}>
                <span>Background</span>
                <select value={bg} onChange={(event) => setBg(event.target.value)}>
                  <option value='#123d79'>Night sky</option>
                  <option value='#5c1a47'>Bubblegum</option>
                  <option value='#1f5e3b'>Forest neon</option>
                  <option value='#5b3a17'>Retro sunset</option>
                </select>
              </label>
              <label className='field' style={{ flex: 1, minWidth: 180 }}>
                <span>Accent</span>
                <input type='color' value={accent} onChange={(event) => setAccent(event.target.value)} />
              </label>
            </div>
            <div className='control-row'>
              <button type='button' onClick={randomize}>Randomize page</button>
              <span className='status-badge'>Marquee tags on</span>
            </div>
            <p className='mini-note'>The preview updates live and the guestbook keeps the old-school feel.</p>
          </div>
        </section>
        <section className='panel'>
          <div className='footer-row'>
            <h2>Preview</h2>
            <span className='mini-note'>Rendered in an iframe</span>
          </div>
          <iframe id='preview' className='preview-frame' title='Geocities preview' srcDoc={previewHtml} />
        </section>
      </main>
      <div className='banner'>
        <marquee behavior='alternate' scrollamount='6'>keep it loud, keep it weird, keep it local</marquee>
      </div>
      <div className='footer-row'>
        <span className='mini-note'>Built for chaos and nostalgia.</span>
        <a href='https://alvinhua.ng' target='_blank' rel='noreferrer'>alvinhua.ng</a>
      </div>
    </div>
  );
}
