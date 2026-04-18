import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
const STOCKFISH_WORKER_PATH = 'stockfish/src/stockfish-nnue-16-single.js';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieces = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

const START_TIME = 300;
const CHAOS_BONUS = 5;
const BLUNDER_THRESHOLD = 180;
const ENGINE_DEPTH = 11;

function squareName(fileIndex, rankIndex) {
  return files[fileIndex] + String(8 - rankIndex);
}

function copyGame(game) {
  return new Chess(game.fen());
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const secs = String(safeSeconds % 60).padStart(2, '0');
  return minutes + ':' + secs;
}

function isGameOver(game) {
  return Boolean(game.isGameOver?.() || game.isCheckmate() || game.isDraw() || game.isStalemate());
}

function materialScore(game) {
  const values = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  let score = 0;

  for (const rank of game.board()) {
    for (const piece of rank) {
      if (!piece) continue;
      const value = values[piece.type] ?? 0;
      score += piece.color === 'w' ? value : -value;
    }
  }

  if (game.isCheck()) {
    score += game.turn() === 'w' ? -25 : 25;
  }

  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 100000 : -100000;
  }

  if (game.isDraw() || game.isStalemate()) {
    return 0;
  }

  return score;
}

function scoreForSide(game, side) {
  return side === 'w' ? materialScore(game) : -materialScore(game);
}

function moveScoreForSide(game, move, side) {
  const next = copyGame(game);
  next.move(move);
  return scoreForSide(next, side);
}

function chooseBestLegalMove(game, side) {
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return null;
  }

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const candidate of legalMoves) {
    const score = moveScoreForSide(game, candidate, side);
    if (score > bestScore) {
      bestScore = score;
      bestMove = candidate;
    }
  }

  return bestMove;
}

function parseUciMove(uci) {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4, 5) : 'q';
  return { from, to, promotion };
}

export default function App() {
  const [sideChoice, setSideChoice] = useState('');
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState('');
  const [whiteClock, setWhiteClock] = useState(START_TIME);
  const [blackClock, setBlackClock] = useState(START_TIME);
  const [statusMessage, setStatusMessage] = useState('Choose a side to start.');
  const [chaosMessage, setChaosMessage] = useState('The chaos clock waits for a blunder.');
  const [engineReady, setEngineReady] = useState(false);
  const [engineThinking, setEngineThinking] = useState(false);

  const engineRef = useRef(null);
  const gameRef = useRef(game);
  const pendingRequestRef = useRef(0);
  const pendingFenRef = useRef('');
  const fallbackTimerRef = useRef(0);
  const engineSideRef = useRef('');

  const engineSide = sideChoice ? (sideChoice === 'w' ? 'b' : 'w') : '';

  const board = useMemo(() => game.board(), [game]);
  const legalTargets = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, selected]);
  const moveHistory = useMemo(() => game.history().slice().reverse(), [game]);
  const chosenSideLabel = sideChoice === 'w' ? 'White' : sideChoice === 'b' ? 'Black' : '';
  const opponentSideLabel = sideChoice === 'w' ? 'Black' : 'White';

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    engineSideRef.current = engineSide;
  }, [engineSide]);

  useEffect(() => {
    let active = true;

    try {
      const engine = new Worker(new URL(STOCKFISH_WORKER_PATH, import.meta.url));
      engineRef.current = engine;
      engine.onmessage = (event) => {
        if (!active) return;
        const line = String(event?.data ?? event ?? '');

        if (line.includes('uciok') || line.includes('readyok')) {
          setEngineReady(true);
          return;
        }

        if (!line.startsWith('bestmove')) {
          return;
        }

        const requestId = pendingRequestRef.current;
        const fen = pendingFenRef.current;
        if (!requestId || !fen) return;
        if (gameRef.current.fen() !== fen || isGameOver(gameRef.current) || gameRef.current.turn() !== engineSideRef.current) {
          return;
        }

        const match = line.match(/^bestmove\s+(\S+)/);
        const parsedMove = parseUciMove(match ? match[1] : '');
        if (!parsedMove) return;

        resolveMove(parsedMove, engineSideRef.current, 'engine');
      };

      engine.postMessage('uci');
      engine.postMessage('setoption name Skill Level value 10');
      engine.postMessage('isready');
    } catch {
      setEngineReady(false);
    }

    return () => {
      active = false;
      try {
        engineRef.current?.terminate();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = gameRef.current;
      if (!sideChoice || isGameOver(current)) return;

      if (current.turn() === 'w') {
        setWhiteClock((value) => Math.max(0, value - 1));
      } else {
        setBlackClock((value) => Math.max(0, value - 1));
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sideChoice]);

  const clearPendingEngineWork = () => {
    pendingRequestRef.current = 0;
    pendingFenRef.current = '';
    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = 0;
    setEngineThinking(false);
  };

  function requestEngineMove(snapshot, forcedEngineSide) {
    const moveSide = forcedEngineSide || engineSide;
    if (!moveSide || isGameOver(snapshot)) return;

    const requestId = pendingRequestRef.current + 1;
    pendingRequestRef.current = requestId;
    pendingFenRef.current = snapshot.fen();
    setEngineThinking(true);
    setStatusMessage('Engine thinking...');

    const engine = engineRef.current;
    const fallback = () => {
      if (pendingRequestRef.current !== requestId) return;
      const move = chooseBestLegalMove(snapshot, moveSide);
      if (move) {
        resolveMove({ from: move.from, to: move.to, promotion: move.promotion || 'q' }, moveSide, 'engine');
      }
    };

    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = window.setTimeout(fallback, 1400);

    try {
      if (!engine || !engineReady) {
        fallback();
        return;
      }

      engine.postMessage('position fen ' + snapshot.fen());
      engine.postMessage('go depth ' + ENGINE_DEPTH);
    } catch {
      fallback();
    }
  }

  function resolveMove(move, moverSide, source) {
    const current = gameRef.current;
    if (isGameOver(current) || current.turn() !== moverSide) return;

    const legalMoves = current.moves({ verbose: true });
    if (legalMoves.length === 0) return;

    let bestScore = -Infinity;
    for (const candidate of legalMoves) {
      const candidateScore = moveScoreForSide(current, candidate, moverSide);
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
      }
    }

    const beforeScore = scoreForSide(current, moverSide);
    const next = copyGame(current);
    next.move(move);
    const afterScore = scoreForSide(next, moverSide);
    const blunderGap = bestScore - afterScore;
    const isBlunder = blunderGap >= BLUNDER_THRESHOLD || beforeScore - afterScore >= 120;

    gameRef.current = next;
    setGame(next);
    setSelected('');
    clearPendingEngineWork();

    if (isBlunder) {
      if (moverSide === 'w') {
        setBlackClock((value) => value + CHAOS_BONUS);
        setChaosMessage('Blunder. Black gets +' + CHAOS_BONUS + ' seconds.');
      } else {
        setWhiteClock((value) => value + CHAOS_BONUS);
        setChaosMessage('Blunder. White gets +' + CHAOS_BONUS + ' seconds.');
      }
      setStatusMessage(source === 'engine' ? 'Engine blunder. Chaos penalty applied.' : 'Blunder. Chaos penalty applied.');
    } else {
      setChaosMessage('No chaos penalty on that move.');
      setStatusMessage(source === 'engine' ? 'Your move.' : 'Engine thinking...');
    }

    if (isGameOver(next)) {
      if (next.isCheckmate()) {
        setStatusMessage('Checkmate.');
      } else if (next.isStalemate()) {
        setStatusMessage('Stalemate.');
      } else if (next.isDraw()) {
        setStatusMessage('Draw.');
      } else {
        setStatusMessage('Game over.');
      }
      return;
    }

    if (source === 'user' && next.turn() === engineSide) {
      requestEngineMove(next, engineSide);
      return;
    }

    setStatusMessage(next.turn() === sideChoice ? 'Your move.' : 'Engine thinking...');
  }

  function startGame(side) {
    const fresh = new Chess();
    gameRef.current = fresh;
    setGame(fresh);
    setSideChoice(side);
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setChaosMessage('The chaos clock waits for a blunder.');
    setStatusMessage(side === 'w' ? 'You are White. Your move.' : 'You are Black. Waiting for White.');
    clearPendingEngineWork();

    if (side === 'b') {
      requestEngineMove(fresh, side === 'w' ? 'b' : 'w');
    }
  }

  function restartGame() {
    if (!sideChoice) {
      startGame('w');
      return;
    }

    startGame(sideChoice);
  }

  function changeSide() {
    const fresh = new Chess();
    gameRef.current = fresh;
    setGame(fresh);
    setSideChoice('');
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setChaosMessage('The chaos clock waits for a blunder.');
    setStatusMessage('Choose a side to start.');
    clearPendingEngineWork();
  }

  function handleSquareClick(square) {
    const current = gameRef.current;
    if (!sideChoice || engineThinking || isGameOver(current) || current.turn() !== sideChoice) return;

    const piece = current.get(square);

    if (selected && legalTargets.includes(square)) {
      resolveMove({ from: selected, to: square, promotion: 'q' }, sideChoice, 'user');
      return;
    }

    if (piece && piece.color === sideChoice) {
      setSelected(square);
      setStatusMessage((piece.color === 'w' ? 'White' : 'Black') + ' ' + piece.type.toUpperCase() + ' selected on ' + square + '.');
      return;
    }

    setSelected('');
    setStatusMessage(sideChoice === 'w' ? 'White to move.' : 'Black to move.');
  }

  if (!sideChoice) {
    return (
      <main className='app-shell select-shell'>
        <section className='select-card'>
          <p className='eyebrow'>chess chaos</p>
          <h1>Chess Chaos</h1>
          <p className='lede'>Pick a side. The engine takes the other side. Bad moves add 5 seconds to the other clock.</p>
          <div className='side-buttons'>
            <button onClick={() => startGame('w')}>Play White</button>
            <button onClick={() => startGame('b')}>Play Black</button>
          </div>
          <p className='chaos-line'>Stockfish is loaded in the background. The chaos rule stays active on every move.</p>
        </section>
      </main>
    );
  }

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <div>
          <p className='eyebrow'>chess chaos</p>
          <h1>Chess Chaos</h1>
          <p className='lede'>You are {chosenSideLabel}. The other side is {opponentSideLabel}. Blunders add 5 seconds to the other clock.</p>
        </div>
        <div className='top-actions'>
          <button onClick={restartGame}>Restart</button>
          <button className='secondary' onClick={changeSide}>Change side</button>
        </div>
      </header>

      <section className='content-grid'>
        <div className='board-panel'>
          <div className='board-frame'>
            <div className='board' aria-label='Chess board'>
              {board.map((rank, rankIndex) =>
                rank.map((cell, fileIndex) => {
                  const square = squareName(fileIndex, rankIndex);
                  const piece = cell;
                  const isDark = (rankIndex + fileIndex) % 2 === 1;
                  const isSelected = selected === square;
                  const isTarget = legalTargets.includes(square);
                  const label = piece ? (piece.color === 'w' ? 'white' : 'black') + ' ' + piece.type + ' on ' + square : 'empty ' + square;

                  return (
                    <button
                      key={square}
                      className={'square ' + (isDark ? 'dark' : 'light') + ' ' + (isSelected ? 'selected' : '') + ' ' + (isTarget ? 'target' : '')}
                      onClick={() => handleSquareClick(square)}
                      aria-label={label}
                    >
                      <span>{piece ? pieces[piece.color][piece.type] : ''}</span>
                      <small>{fileIndex === 0 ? 8 - rankIndex : ''}</small>
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <aside className='sidebar'>
          <section className='panel status-panel'>
            <p className='panel-label'>Clocks</p>
            <div className='clock-grid'>
              <div className={game.turn() === 'w' ? 'clock active' : 'clock'}>
                <span>White</span>
                <strong>{formatClock(whiteClock)}</strong>
              </div>
              <div className={game.turn() === 'b' ? 'clock active' : 'clock'}>
                <span>Black</span>
                <strong>{formatClock(blackClock)}</strong>
              </div>
            </div>
            <p className='status-text'>{statusMessage}</p>
            <p className='chaos-line'>{chaosMessage}</p>
          </section>

          <section className='panel status-panel'>
            <p className='panel-label'>Chaos rule</p>
            <p className='status-text'>A bad move is judged against the best legal move by a simple material engine. If the move lags behind by enough, the other side gets +5 seconds.</p>
            <div className='mini-stats'>
              <div>
                <span>Turn</span>
                <strong>{game.turn() === 'w' ? 'White' : 'Black'}</strong>
              </div>
              <div>
                <span>Legal moves</span>
                <strong>{legalTargets.length}</strong>
              </div>
            </div>
          </section>

          <section className='panel status-panel'>
            <p className='panel-label'>Engine</p>
            <p className='status-text'>{engineThinking ? 'Thinking...' : engineReady ? 'Ready.' : 'Loading.'}</p>
          </section>

          <section className='panel instructions-panel'>
            <p className='panel-label'>How it works</p>
            <ul>
              <li>Tap a piece to select it.</li>
              <li>Target squares are marked with a border.</li>
              <li>Blunders hand out bonus time to the other side.</li>
            </ul>
          </section>

          <section className='panel move-log'>
            <p className='panel-label'>Move history</p>
            {moveHistory.length === 0 ? (
              <p className='muted'>No moves yet.</p>
            ) : (
              <ol>
                {moveHistory.map((move) => (
                  <li key={move}>{move}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
