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
  const moveHistory = useMemo(() => game.history().slice().reverse(), [game]);

  const nextStatus = () => {
    if (game.isCheckmate()) return 'Checkmate. Hit restart to play again.';
    if (game.isDraw()) return 'Draw. The board has given up.';
    if (game.isStalemate()) return 'Stalemate. No legal moves remain.';
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
      <header className='topbar'>
        <div>
          <p className='eyebrow'>chess chaos</p>
          <h1>Big board, light controls, no page scroll.</h1>
          <p className='lede'>A wide two-column layout with the board on the left and the controls on the right.</p>
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
            <p className='panel-label'>Status</p>
            <p className='status-text'>{statusMessage}</p>
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
              <li>The board stays centered and scaled to the viewport.</li>
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
