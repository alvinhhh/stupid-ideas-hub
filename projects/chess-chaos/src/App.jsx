import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieces = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

const START_TIME = 300;
const CHAOS_BONUS = 5;
const BLUNDER_THRESHOLD = 180;

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

function evaluateMove(game, move) {
  const next = copyGame(game);
  next.move(move);
  return evaluateBoard(next);
}

export default function App() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState('');
  const [statusMessage, setStatusMessage] = useState('Select a piece to begin.');
  const [whiteClock, setWhiteClock] = useState(START_TIME);
  const [blackClock, setBlackClock] = useState(START_TIME);
  const [lastChaos, setLastChaos] = useState('The chaos clock is ready.');

  const legalTargets = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, selected]);

  const board = useMemo(() => game.board(), [game]);
  const moveHistory = useMemo(() => game.history().slice().reverse(), [game]);
  const activeClock = game.turn() === 'w' ? whiteClock : blackClock;

  useEffect(() => {
    if (game.isGameOver?.() || game.isCheckmate() || game.isDraw() || game.isStalemate()) {
      return;
    }

    const timer = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteClock((value) => Math.max(0, value - 1));
      } else {
        setBlackClock((value) => Math.max(0, value - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game]);

  const nextStatus = (futureGame = game) => {
    if (futureGame.isCheckmate()) return 'Checkmate. Hit restart to play again.';
    if (futureGame.isDraw()) return 'Draw. The board has given up.';
    if (futureGame.isStalemate()) return 'Stalemate. No legal moves remain.';
    if (futureGame.isCheck()) return 'Check on ' + (futureGame.turn() === 'w' ? 'white' : 'black') + '.';
    return (futureGame.turn() === 'w' ? 'White' : 'Black') + ' to move.';
  };

  const handleSquareClick = (square) => {
    const piece = game.get(square);

    if (selected && legalTargets.includes(square)) {
      const mover = game.turn();
      const move = { from: selected, to: square, promotion: 'q' };
      const preMoveScore = evaluateBoard(game);
      const bestScore = game
        .moves({ verbose: true })
        .reduce((best, candidate) => Math.max(best, evaluateMove(game, candidate)), -Infinity);
      const next = copyGame(game);
      next.move(move);
      const postMoveScore = evaluateBoard(next);
      const blunderGap = bestScore - postMoveScore;
      const isBlunder = blunderGap >= BLUNDER_THRESHOLD || postMoveScore < preMoveScore - 120;

      setGame(next);
      setSelected('');
      setWhiteClock((value) => (mover === 'w' && isBlunder ? value : value));
      setBlackClock((value) => (mover === 'b' && isBlunder ? value : value));
      if (isBlunder) {
        if (mover === 'w') {
          setBlackClock((value) => value + CHAOS_BONUS);
          setLastChaos('Blunder spotted. Black gets +' + CHAOS_BONUS + ' seconds.');
        } else {
          setWhiteClock((value) => value + CHAOS_BONUS);
          setLastChaos('Blunder spotted. White gets +' + CHAOS_BONUS + ' seconds.');
        }
        setStatusMessage('Dumb move detected. The chaos clock fires.');
      } else {
        setLastChaos('Clean move. No chaos bonus awarded.');
        setStatusMessage(nextStatus(next));
      }
      return;
    }

    if (piece && piece.color === game.turn()) {
      setSelected(square);
      setStatusMessage((piece.color === 'w' ? 'White' : 'Black') + ' ' + piece.type.toUpperCase() + ' selected on ' + square + '.');
      return;
    }

    setSelected('');
    setStatusMessage(nextStatus());
  };

  const restart = () => {
    setGame(new Chess());
    setSelected('');
    setWhiteClock(START_TIME);
    setBlackClock(START_TIME);
    setStatusMessage('New game started. White to move.');
    setLastChaos('The chaos clock is ready.');
  };

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <div>
          <p className='eyebrow'>chess chaos</p>
          <h1>Big board, tight clocks, chaos on every dumb move.</h1>
          <p className='lede'>A wide two-column layout with the board on the left and the controls on the right. Blunders hand out five bonus seconds to the other side.</p>
        </div>
        <button onClick={restart}>Restart game</button>
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
            <p className='status-text'>A bad move is judged against the best legal move by a simple material engine. If the move lags behind by enough, the opponent gets +5 seconds.</p>
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

          <section className='panel instructions-panel'>
            <p className='panel-label'>How it works</p>
            <ul>
              <li>Tap a piece to select it.</li>
              <li>Target squares light up in green.</li>
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
