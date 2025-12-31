'use client';

import { useState, useEffect, useCallback } from 'react';
import Keyboard from '@/components/Keyboard';
import wordList from '@/app/wordlist.json'; // Import the word list we created

// Define the types for coloring
type TileStatus = 'correct' | 'present' | 'absent' | '';

export default function Home() {
  
  const [solution, setSolution] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const showMessage = (text: string, duration = 2000) => {
    setMessage(text);

  setTimeout(() => {
    setMessage(null);
  }, duration);
};
  // 2. Track the board state
  const [board, setBoard] = useState<string[][]>(
    Array(6).fill(null).map(() => Array(5).fill(''))
  );
  const [tileStatus, setTileStatus] = useState<TileStatus[][]>(
    Array(6).fill(null).map(() => Array(5).fill(''))
  );
  // We need this to pass color data to the on-screen keyboard
  const [keyStatus, setKeyStatus] = useState<Record<string, TileStatus>>({});

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Restart game function
  const restartGame = () => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setSolution(randomWord.toUpperCase());
    setBoard(Array(6).fill(null).map(() => Array(5).fill('')));
    setTileStatus(Array(6).fill(null).map(() => Array(5).fill('')));
    setKeyStatus({});
    setCurrentRow(0);
    setCurrentCol(0);
    setGameState('playing');
    setMessage(null);
    console.log("New solution:", randomWord); // For testing
  };

  // Initialize game
  useEffect(() => {
    restartGame();
  }, []);

  // --- LOGIC HELPER: CALCULATE COLORS ---
  const getWordStatus = (guess: string[], solutionStr: string) => {
    const solutionChars = solutionStr.split('');
    const statusArr: TileStatus[] = Array(5).fill('absent');

    // Pass 1: Green (Correct Position)
    guess.forEach((letter, i) => {
      if (letter === solutionChars[i]) {
        statusArr[i] = 'correct';
        solutionChars[i] = ''; // Remove so it's not matched again
      }
    });

    // Pass 2: Yellow (Wrong Position)
    guess.forEach((letter, i) => {
      if (statusArr[i] !== 'correct') {
        const indexInSolution = solutionChars.indexOf(letter);
        if (indexInSolution > -1) {
          statusArr[i] = 'present';
          solutionChars[indexInSolution] = '';
        }
      }
    });
    return statusArr;
  };

  // --- MAIN INPUT HANDLER ---
  // Wrapped in useCallback so the keyboard listener always sees fresh state
  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'Enter') {
      if (currentCol === 5 && currentRow < 6) {
        const currentGuessArr = board[currentRow];
        const currentGuessStr = currentGuessArr.join('');

        // 1. Validation
        if (!wordList.includes(currentGuessStr)) {
          alert("Not in word list");
          return;
        }

        // 2. Get Colors
        const rowStatus = getWordStatus(currentGuessArr, solution);

        // 3. Update Tile Colors
        const newTileStatus = [...tileStatus];
        newTileStatus[currentRow] = rowStatus;
        setTileStatus(newTileStatus);

        // 4. Update Keyboard Colors
        setKeyStatus(prev => {
          const newKeys = { ...prev };
          currentGuessArr.forEach((letter, index) => {
            const status = rowStatus[index];
            const current = newKeys[letter];
            // Green beats Yellow, Yellow beats Gray
            if (status === 'correct') newKeys[letter] = 'correct';
            else if (status === 'present' && current !== 'correct') newKeys[letter] = 'present';
            else if (status === 'absent' && current !== 'correct' && current !== 'present') newKeys[letter] = 'absent';
          });
          return newKeys;
        });

        // 5. Check Win/Loss
        if (currentGuessStr === solution) {
          setGameState('won');
          showMessage("🎉 You won!", 10000);
        } else if (currentRow === 5) {
          setGameState('lost');
          showMessage(`Game over! Word was ${solution}`, 10000);
        } else {
          setCurrentRow(prev => prev + 1);
          setCurrentCol(0);
        }
      }
    } else if (key === '⌫') {
      if (currentCol > 0) {
        setBoard(prev => {
          const newBoard = [...prev];
          newBoard[currentRow][currentCol - 1] = '';
          return newBoard;
        });
        setCurrentCol(prev => prev - 1);
      }
    } else if (key.length === 1 && key.match(/[A-Z]/) && currentCol < 5) {
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[currentRow][currentCol] = key;
        return newBoard;
      });
      setCurrentCol(prev => prev + 1);
    }
  }, [board, currentCol, currentRow, gameState, solution, tileStatus]);


  // --- PHYSICAL KEYBOARD LISTENER (NEW) ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === 'Enter') {
        handleKeyPress('Enter');
      } else if (key === 'Backspace') {
        handleKeyPress('⌫');
      } else if (/^[a-zA-Z]$/.test(key)) {
        handleKeyPress(key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);


  // --- HELPER TO MAINTAIN YOUR STYLING LOGIC ---
  const getCellClassName = (rowIndex: number, colIndex: number) => {
    const status = tileStatus[rowIndex][colIndex];
    const letter = board[rowIndex][colIndex];

    // Your Base Styles
    let classes = "size-12 border-2 flex items-center justify-center text-xl font-bold uppercase ";

    // Active Cell Logic (Your Blue Border)
    if (rowIndex === currentRow && colIndex === Math.min(currentCol, 4) && gameState === 'playing') {
      return classes + "border-blue-500";
    }

    // Coloring Logic (Green/Yellow/Gray)
    // If it has a status (meaning row is submitted), apply background colors
    if (status === 'correct') {
      return classes + "bg-green-500 text-white border-green-500";
    } else if (status === 'present') {
      return classes + "bg-yellow-500 text-white border-yellow-500";
    } else if (status === 'absent') {
      return classes + "bg-gray-500 text-white border-gray-500";
    }

    // Default Empty/Filled state (Your Gray Border)
    if (letter) {
      return classes + "border-gray-600"; // Slightly darker when letter is typed but not submitted
    }
    
    return classes + "border-gray-400";
  };

  return (
    <section className="flex flex-col items-center min-h-screen">
      <h1 className="text-3xl font-bold my-3 md:my-5 w-full text-center">Wordle</h1>
     
      
      <div className="grid gap-2 mb-5 ">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2 ">
            {row.map((letter, colIndex) => (
              <div
                key={colIndex}
                className={getCellClassName(rowIndex, colIndex)}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
         {message && (
  <div className="text-center m-3 text-lg font-semibold text-blue-500">
    {message}
  </div>
)}
      <Keyboard onKeyPress={handleKeyPress} keyStatus={keyStatus} />
<button
  onClick={(e) => {
    // 1. If detail is 0, it was triggered by the Keyboard (Enter key). We ignore it.
    if (e.detail === 0) return;

    // 2. Remove focus from the button immediately. 
    // This ensures your physical keyboard types letters instead of hitting this button again.
    e.currentTarget.blur();

    // 3. Actually restart the game
    restartGame();
  }}
  className="m-5 md:m-7 px-6 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-colors duration-200"
>
  Restart
</button>
    </section>
  );
}
