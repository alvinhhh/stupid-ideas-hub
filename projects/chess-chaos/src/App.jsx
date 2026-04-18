import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import * as StockfishModule from 'stockfish';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieces = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

const START_TIME = 300;
const CHAOS_BONUS = 5;
const BLUNDER_THRESHOLD = 180;
const ENGINE_MOVE_TIME = 400;

const stockfishFactory =
  typeof StockfishModule.default === 'function'
    ? StockfishModule.default
    : typeof StockfishModule.stockfish === 'function'
      ? StockfishModule.stockfish
      : null;

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

function opposite(side) {
  return side === 'w' ? 'b' : 'w';
}

function sideLabel(side) {
  return side === 'w' ? 'White' : 'Black';
}

function evaluateBoard(game) {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 100000 : -100000;
  }

  if (game.isDraw() || game.isStalemate()) {
    return 0;
  }

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

  return score;
}

function evaluateMoveForSide(game, move, side) {
  const next = copyGame(game);
  next.move(move);
  const score = evaluateBoard(next);
  return side === 'w' ? score : -score;
}

function chooseHeuristicMove(game, side) {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const score = evaluateMoveForSide(game, move, side);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function parseUciMove(game, uci) {
  const match = String(uci || '').trim().match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/i);
  if (!match) return null;

  const move = {
    from: match[1],
    to: match[2],
  };

  if (match[3]) {
    move.promotion = match[3].toLowerCase();
  }

  const legal = game.moves({ verbose: true }).some((candidate) => {
    return (
      candidate.from === move.from &&
      candidate.to === move.to &&
      (!move.promotion || candidate.promotion === move.promotion)
    );
  });

  return legal ? move : null;
}

export default function App() {
  const [phase, setPhase] = useState('select-side');
  const [userSide, setUserSide] = useState(null);
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState('');
  const [statusMessage, setStatusMessage] = useState('Choose a side to begin.');
  const [whiteClock, setWhiteClock] = useState(START_TIME);
  const [blackClock, setBlackClock] = useState(START_TIME);
  const [lastChaos, setLastChaos] = useState('The chaos clock is waiting.');
  const [engineThinking, setEngineThinking] = useState(false);

  const engineRef = useRef(null);
  const engineResolveRef = useRef(null);
  const engineTimeoutRef = useRef(null);

  const legalTargets = useMemo(() => {
    if (!selected || phase !== 'playing') return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, phase, selected]);

  const board = useMemo(() => game.board(), [game]);
  const moveHistory = useMemo(() => game.history().slice().reverse(), [game]);
  const engineSide = userSide ? opposite(userSide) : null;
  const gameOver = game.isCheckmate() || game.isDraw() || game.isStalemate();

  useEffect(() => {
    if (phase !== 'playing' || gameOver) return;

    const timer = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteClock((value) => Math.max(0, value - 1));
      } else {
        setBlackClock((value) => Math.max(0, value - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameOver, phase]);

  useEffect(() => {
    return () => {
      if (engineTimeoutRef.current) {
        clearTimeout(engineTimeoutRef.current);
        engineTimeoutRef.current = null;
      }
      if (engineRef.current && typeof engineRef.current.postMessage === 'function') {
        try {
          engineRef.current.postMessage('quit');
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || !engineSide || gameOver) return;
    if (game.turn() !== engineSide) return;

    let cancelled = false;
    setEngineThinking(true);
    setStatusMessage(sideLabel(engineSide) + ' is thinking.');

    const requestMove = async () => {
      const engineMove = await getEngineMove(game, engineSide, engineRef, engineResolveRef, engineTimeoutRef);
      if (cancelled) return;
      const move = parseUciMove(game, engineMove) || chooseHeuristicMove(game, engineSide);
      if (!move) {
        setEngineThinking(false);
        return;
      }
      commitMove(move, engineSide, 'engine');
      setEngineThinking(false);
    };

    requestMove();

    return () => {
      cancelled = true;
    };
  }, [engineSide, game, gameOver, phase]);

  async function getEngineMove(currentGame, side, engineRefValue, resolveRefValue, timeoutRefValue) {
    const fallback = chooseHeuristicMove(currentGame, side);

    if (!stockfishFactory) {
      return fallback ? encodeMove(fallback) : '';
    }

    let engine = engineRefValue.current;
    if (!engine) {
      try {
        engine = stockfishFactory();
      } catch {
        engine = null;
      }

      if (!engine || typeof engine.postMessage !== 'function') {
        engineRefValue.current = null;
        return fallback ? encodeMove(fallback) : '';
      }

      engineRefValue.current = engine;
      engine.onmessage = (event) => {
        const data = typeof event === 'string' ? event : event?.data;
        if (typeof data !== 'string') return;
        if (!data.startsWith('bestmove')) return;

        const parts = data.trim().split(/s+/);
        const bestmove = parts[1] || '';
        if (resolveRefValue.current) {
          const resolver = resolveRefValue.current;
          resolveRefValue.current = null;
          resolver(bestmove);
        }
      };

      try {
        engine.postMessage('uci');
        engine.postMessage('isready');
      } catch {
        engineRefValue.current = null;
        return fallback ? encodeMove(fallback) : '';
      }
    }

    return await new Promise((resolve) => {
      resolveRefValue.current = resolve;
      if (timeoutRefValue.current) {
        clearTimeout(timeoutRefValue.current);
      }
      timeoutRefValue.current = setTimeout(() => {
        if (resolveRefValue.current) {
          const fallbackMove = fallback ? encodeMove(fallback) : '';
          const resolver = resolveRefValue.current;
          resolveRefValue.current = null;
          resolver(fallbackMove);
        }
      }, ENGINE_MOVE_TIME + 1200);

      try {
        engine.postMessage('ucinewgame');
        engine.postMessage('position fen ' + currentGame.fen());
        engine.postMessage('go movetime ' + ENGINE_MOVE_TIME);
      } catch {
        if (resolveRefValue.current) {
          const fallbackMove = fallback ? encodeMove(fallback) : '';
          const resolver = resolveRefValue.current;
          resolveRefValue.current = null;
          resolver(fallbackMove);
        }
      }
    });
  }

  function encodeMove(move) {
    if (!move) return '';
    return move.from + move.to + (move.promotion || '');
  }

  function nextStatus(futureGame = game) {
    if (futureGame.isCheckmate()) return 'Checkmate. Hit restart to play again.';
    if (futureGame.isDraw()) return 'Draw. The board has given up.';
    if (futureGame.isStalemate()) return 'Stalemate. No legal moves remain.';
    if (futureGame.isCheck()) return 'Check on ' + sideLabel(futureGame.turn()).toLowerCase() + '.';
    return sideLabel(futureGame.turn()) + ' to move.';
  }

  function resolveMoveOutcome(baseGame, move, moverSide) {
    const next = copyGame(baseGame);
    next.move(move);

    const currentScore = evaluateBoard(baseGame) * (moverSide === 'w' ? 1 : -1);
    const bestScore = baseGame
      .moves({ verbose: true })
      .reduce((best, candidate) => Math.max(best, evaluateMoveForSide(baseGame, candidate, moverSide)), -Infinity);
    const moveScore = evaluateBoard(next) * (moverSide === 'w' ? 1 : -1);
    const blunderGap = bestScore - moveScore;
    const isBlunder = blunderGap >= BLUNDER_THRESHOLD || currentScore - moveScore >= 120;

    return { next, isBlunder };
  }

  function commitMove(move, moverSide, source) {
    const outcome = resolveMoveOutcome(game, move, moverSide);
    setGame(outcome.next);
    setSelected('');

    if (outcome.isBlunder) {
      if (moverSide === 'w') {
        setBlackClock((value) => value + CHAOS_BONUS);
        setLastChaos('Blunder spotted. Black gets +' + CHAOS_BONUS + ' seconds.');
      } else {
        setWhiteClock((value) => value + CHAOS_BONUS);
        setLastChaos('Blunder spotted. White gets +' + CHAOS_BONUS + ' seconds.');
      }
      setStatusMessage((source === 'engine' ? 'Engine' : 'Dumb') + ' move triggered the chaos clock.');
    } else {
      setLastChaos('Clean move. No chaos bonus awarded.');
      setStatusMessage(nextStatus(outcome.next));
    }
  }

  function startSide(side) {
    setUserSide(side);
    setPhase('playing');
    setGame(new Chess());
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setStatusMessage(side === 'w' ? 'You are White. White to move.' : 'You are Black. White starts.');
    setLastChaos('The chaos clock is waiting.');
  }

  function resetSideSelect() {
    setPhase('select-side');
    setUserSide(null);
    setGame(new Chess());
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setStatusMessage('Choose a side to begin.');
    setLastChaos('The chaos clock is waiting.');
    setEngineThinking(false);
  }

  function restartGame() {
    setGame(new Chess());
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setLastChaos('The chaos clock is waiting.');
    setStatusMessage(userSide === 'w' ? 'White to move.' : userSide === 'b' ? 'White starts.' : 'Choose a side to begin.');
    setEngineThinking(false);
  }

  function handleSquareClick(square) {
    if (phase !== 'playing' || gameOver || !userSide) return;
    if (game.turn() !== userSide) return;

    const piece = game.get(square);

    if (selected && legalTargets.includes(square)) {
      const move = { from: selected, to: square, promotion: 'q' };
      commitMove(move, userSide, 'user');
      return;
    }

    if (piece && piece.color === game.turn()) {
      setSelected(square);
      setStatusMessage(sideLabel(piece.color) + ' ' + piece.type.toUpperCase() + ' selected on ' + square + '.');
      return;
    }

    setSelected('');
    setStatusMessage(nextStatus());
  }

  if (phase === 'select-side') {
    return (
      <main className='app-shell select-shell'>
        <section className='select-card'>
          <p className='eyebrow'>Chess Chaos</p>
          <h1>Chess Chaos</h1>
          <p className='lede'>Choose a side. Stockfish plays the other side, and the chaos clock adds 5 seconds when someone makes a bad move.</p>
          <div className='side-buttons'>
            <button onClick={() => startSide('w')}>Play White</button>
            <button onClick={() => startSide('b')}>Play Black</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <h1>Chess Chaos</h1>
        <div className='top-actions'>
          <button className='secondary' onClick={resetSideSelect}>Change side</button>
          <button onClick={restartGame}>Restart game</button>
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
            <p className='chaos-line'>{lastChaos}</p>
          </section>

          <section className='panel status-panel'>
            <p className='panel-label'>Chaos rule</p>
            <p className='status-text'>Each move is scored against the best legal move from that side. If the move is weak enough, the other clock gets +5 seconds.</p>
            <div className='mini-stats'>
              <div>
                <span>Your side</span>
                <strong>{userSide ? sideLabel(userSide) : 'None'}</strong>
              </div>
              <div>
                <span>Engine side</span>
                <strong>{engineSide ? sideLabel(engineSide) : 'Waiting'}</strong>
              </div>
            </div>
          </section>

          <section className='panel instructions-panel'>
            <p className='panel-label'>How it works</p>
            <ul>
              <li>Pick White or Black first.</li>
              <li>Stockfish plays the other side.</li>
              <li>Bad moves trigger the chaos clock.</li>
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
