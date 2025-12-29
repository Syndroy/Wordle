'use client';

import { useState } from 'react';
import Keyboard from '@/components/Keyboard';

export default function Home() {
  const [board, setBoard] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(''))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
     
      if (currentCol === 5 && currentRow < 5) {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
      }
    } else if (key === '⌫') {
   
      if (currentCol > 0) {
        const newBoard = [...board];
        newBoard[currentRow][currentCol - 1] = '';
        setBoard(newBoard);
        setCurrentCol(currentCol - 1);
      }
    } else if (key.length === 1 && key.match(/[A-Z]/) && currentCol < 5) {
 
      const newBoard = [...board];
      newBoard[currentRow][currentCol] = key;
      setBoard(newBoard);
      setCurrentCol(currentCol + 1);
    }
  };

  return (
    <section>
      <h1 className="text-center text-3xl border-t-2 border-b-2">Wordle</h1>
      <div className="grid gap-3 mx-auto max-w-xl mt-20 justify-center">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {row.map((letter, colIndex) => (
              <div
                key={colIndex}
                className={`size-14 border-2 flex items-center justify-center text-xl font-bold uppercase ${
                  rowIndex === currentRow && colIndex === Math.min(currentCol, 4)
                    ? 'border-blue-500'
                    : 'border-gray-400'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Keyboard onKeyPress={handleKeyPress} />
    </section>
  );
}
