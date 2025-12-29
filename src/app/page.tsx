// 'use client';

// import { useState } from 'react';
// import Keyboard from '@/components/Keyboard';

// export default function Home() {
//   const [board, setBoard] = useState<string[][]>(
//     Array(6).fill(null).map(() => Array(5).fill(''))
//   );
//   const [currentRow, setCurrentRow] = useState(0);
//   const [currentCol, setCurrentCol] = useState(0);

//   const handleKeyPress = (key: string) => {
//     if (key === 'Enter') {
     
//       if (currentCol === 5 && currentRow < 5) {
//         setCurrentRow(currentRow + 1);
//         setCurrentCol(0);
//       }
//     } else if (key === '⌫') {
   
//       if (currentCol > 0) {
//         const newBoard = [...board];
//         newBoard[currentRow][currentCol - 1] = '';
//         setBoard(newBoard);
//         setCurrentCol(currentCol - 1);
//       }
//     } else if (key.length === 1 && key.match(/[A-Z]/) && currentCol < 5) {
 
//       const newBoard = [...board];
//       newBoard[currentRow][currentCol] = key;
//       setBoard(newBoard);
//       setCurrentCol(currentCol + 1);
//     }
//   };

//   return (
//     <section>
//       <h1 className="text-center text-3xl border-t-2 border-b-2">Wordle</h1>
//       <div className="grid gap-3 mx-auto max-w-xl mt-20 justify-center">
//         {board.map((row, rowIndex) => (
//           <div key={rowIndex} className="grid grid-cols-5 gap-2">
//             {row.map((letter, colIndex) => (
//               <div
//                 key={colIndex}
//                 className={`size-14 border-2 flex items-center justify-center text-xl font-bold uppercase ${
//                   rowIndex === currentRow && colIndex === Math.min(currentCol, 4)
//                     ? 'border-blue-500'
//                     : 'border-gray-400'
//                 }`}
//               >
//                 {letter}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//       <Keyboard onKeyPress={handleKeyPress} />
//     </section>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import Keyboard from '@/components/Keyboard';
import wordList from '@/app/wordlist.json'; // Make sure this path is correct

// Types for tile status
type TileStatus = 'correct' | 'present' | 'absent' | '';

export default function Home() {
  // 1. Pick a random solution on start
  const [solution, setSolution] = useState('');
  
  // 2. Track the board state
  const [board, setBoard] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(''))
  );
  
  // 3. Track the COLOR status of each tile
  const [tileStatus, setTileStatus] = useState<TileStatus[][]>(
    Array(6).fill(null).map(() => Array(5).fill(''))
  );

  // 4. Track keyboard colors (Green keys, Yellow keys, etc.)
  const [keyStatus, setKeyStatus] = useState<Record<string, TileStatus>>({});

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize game
  useEffect(() => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setSolution(randomWord.toUpperCase());
    console.log("Solution:", randomWord); // For testing
  }, []);

  const getWordStatus = (guess: string[], solutionStr: string) => {
    const solutionChars = solutionStr.split('');
    const statusArr: TileStatus[] = Array(5).fill('absent');
    
    // Pass 1: Find Greens (Correct Position)
    // We do this first so they "lock in" the letters
    guess.forEach((letter, i) => {
      if (letter === solutionChars[i]) {
        statusArr[i] = 'correct';
        solutionChars[i] = ''; // Remove from solution pool so it can't be matched again
      }
    });

    // Pass 2: Find Yellows (Present but wrong spot)
    guess.forEach((letter, i) => {
      if (statusArr[i] !== 'correct') { // Only check if not already green
        const indexInSolution = solutionChars.indexOf(letter);
        if (indexInSolution > -1) {
          statusArr[i] = 'present';
          solutionChars[indexInSolution] = ''; // Remove used letter
        }
      }
    });

    return statusArr;
  };

  const handleKeyPress = (key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'Enter') {
      if (currentCol === 5) {
        const currentGuessArr = board[currentRow];
        const currentGuessStr = currentGuessArr.join('');

        // Optional: Check if word exists in list (Validation)
        // if (!wordList.includes(currentGuessStr)) { alert("Not in word list"); return; }

        // 1. Calculate Colors
        const rowStatus = getWordStatus(currentGuessArr, solution);
        
        // 2. Update Tile Colors
        const newTileStatus = [...tileStatus];
        newTileStatus[currentRow] = rowStatus;
        setTileStatus(newTileStatus);

        // 3. Update Keyboard Colors
        const newKeyStatus = { ...keyStatus };
        currentGuessArr.forEach((letter, index) => {
          const status = rowStatus[index];
          // Logic: Green overrides Yellow, Yellow overrides Gray
          const currentStatus = newKeyStatus[letter];
          if (status === 'correct') {
            newKeyStatus[letter] = 'correct';
          } else if (status === 'present' && currentStatus !== 'correct') {
            newKeyStatus[letter] = 'present';
          } else if (status === 'absent' && currentStatus !== 'correct' && currentStatus !== 'present') {
            newKeyStatus[letter] = 'absent';
          }
        });
        setKeyStatus(newKeyStatus);

        // 4. Check Win/Loss
        if (currentGuessStr === solution) {
          setGameState('won');
          alert('You Won!');
        } else if (currentRow === 5) {
          setGameState('lost');
          alert(`Game Over! Word was ${solution}`);
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentCol(0);
        }
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

  // Helper for CSS classes
  const getCellStyles = (row: number, col: number) => {
    const status = tileStatus[row][col];
    const base = "size-14 border-2 flex items-center justify-center text-xl font-bold uppercase transition-colors duration-500";
    
    // Active Cell Border
    if (row === currentRow && col === currentCol) return `${base} border-gray-600 border-b-4`;
    if (row === currentRow) return `${base} border-gray-400`;

    // Colored Cells (Past Guesses)
    if (status === 'correct') return `${base} bg-green-500 text-white border-green-500`;
    if (status === 'present') return `${base} bg-yellow-500 text-white border-yellow-500`;
    if (status === 'absent') return `${base} bg-gray-500 text-white border-gray-500`;

    return `${base} border-gray-200`;
  };

  return (
    <section className="flex flex-col items-center min-h-screen py-10">
      <h1 className="text-3xl font-bold mb-10 border-b-2 pb-2 px-10">Wordle</h1>
     
      
      <div className="grid gap-2 mb-10">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {row.map((letter, colIndex) => (
              <div
                key={colIndex}
                className={getCellStyles(rowIndex, colIndex)}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <Keyboard onKeyPress={handleKeyPress} keyStatus={keyStatus} />
    </section>
  );
}