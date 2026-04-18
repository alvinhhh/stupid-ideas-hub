import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieces = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

function squareName(fileIndex, rankIndex) {
  return files[fileIndex] + String(8 - rankIndex);
}

function copyGame(game) {
  return new Chess(game.fen());
}

export default function App() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState('');
  const [statusMessage, setStatusMessage] = useState('Select a piece to begin.');

  const legalTargets = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, selected]);

  const board = useMemo(() => game.board(), [game]);

  const nextStatus = () => {
    if (game.isCheckmate()) return "Checkmate. Hit restart to play again.";
    if (game.isDraw()) return "Draw. The board has given up.";
    if (game.isStalemate()) return "Stalemate. No legal moves remain.";
    if (game.isCheck()) return 'Check on ' + (game.turn() === 'w' ? 'white' : 'black') + '.';
    return (game.turn() === 'w' ? 'White' : 'Black') + ' to move.';
  };

  const handleSquareClick = (square) => {
    const piece = game.get(square);

    if (selected && legalTargets.includes(square)) {
      const next = copyGame(game);
      next.move({ from: selected, to: square, promotion: 'q' });
      setGame(next);
      setSelected('');
      setStatusMessage(nextStatus());
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
    setStatusMessage('New game started. White to move.');
  };

  return (
    <main className='app-shell'>
      <section className='hero-card'>
        <p className='eyebrow'>chess chaos</p>
        <h1>Play legal chess, then keep the chaos moving.</h1>
        <p className='lede'>A compact chess board with move selection, legal move highlighting, and a clean restart loop.</p>
        <div className='actions'>
          <button onClick={restart}>Restart game</button>
          <span className='meta'>{statusMessage}</span>
        </div>
      </section>

      <section className='board-card'>
        <div className='board'>
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
                  className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isTarget ? 'target' : ''}`}
                  onClick={() => handleSquareClick(square)}
                  aria-label={label}
                >
                  <span>{piece ? pieces[piece.color][piece.type] : ""}</span>
                  <small>{fileIndex === 0 ? 8 - rankIndex : ''}</small>
                </button>
              );
            }),
          )}
        </div>
        <div className='move-log'>
          <h2>Move history</h2>
          <ol>
            {game.history().slice().reverse().map((move) => (
              <li key={move}>{move}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
