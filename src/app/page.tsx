'use client';

import { useState, useEffect, useCallback } from 'react';
import Keyboard from '@/components/Keyboard';

type TileStatus = 'correct' | 'present' | 'absent' | '';

export default function Home() {
  const [gameId, setGameId] = useState<number | null>(null); // Store the ID
  const [board, setBoard] = useState<string[][]>(Array(6).fill(null).map(() => Array(5).fill('')));
  const [tileStatus, setTileStatus] = useState<TileStatus[][]>(Array(6).fill(null).map(() => Array(5).fill('')));
  const [keyStatus, setKeyStatus] = useState<Record<string, TileStatus>>({});
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isProcessing, setIsProcessing] = useState(false); 

  const [hintUsed, setHintUsed] = useState(false); 
  const [hintMessage, setHintMessage] = useState('');

  // 1. Fetch ID from Server on Start/Restart
  const startNewGame = async () => {
    // Reset UI
    setBoard(Array(6).fill(null).map(() => Array(5).fill('')));
    setTileStatus(Array(6).fill(null).map(() => Array(5).fill('')));
    setKeyStatus({});
    setCurrentRow(0);
    setCurrentCol(0);
    setGameState('playing');
    setHintUsed(false); 
    setHintMessage('');

    try {
      // Call API to get a random ID
      const res = await fetch('/api/game');
      const data = await res.json();
      setGameId(data.gameId);
      console.log("Game ID:", data.gameId); // Safe to log ID, it's not the word
    } catch (e) {
      console.error("Failed to start game");
    }
  };

  useEffect(() => {
    startNewGame();
  }, []);


  const getHint = async () => {
    // Double check: Prevent call if rules aren't met
    if (currentRow < 3 || hintUsed || gameState !== 'playing') return;

    try {
      // Send previous finished guesses to server so it knows what to reveal
      const previousGuesses = board.slice(0, currentRow).map(row => row.join(''));

      const res = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: gameId, 
          guesses: previousGuesses 
        }),
      });

      const data = await res.json();

      if (data.letter) {
        setHintUsed(true); // Lock the button
        // Display hint to user
        alert(`💡 HINT: The letter at position ${data.index + 1} is "${data.letter}"`);
      } else if (data.message) {
        alert(data.message); // e.g. "You found all letters already!"
      }

    } catch (error) {
      console.error("Hint Error", error);
    }
  };

  // 2. Handle Logic via API
  const handleKeyPress = useCallback(async (key: string) => {
    if (gameState !== 'playing' || gameId === null || isProcessing) return; //

    if (key === 'Enter') {
      if (currentCol === 5) {
        const currentGuessArr = board[currentRow];
        const currentGuessStr = currentGuessArr.join('');

        try {
          // SEND GUESS + ID TO SERVER
          const response = await fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess: currentGuessStr, gameId: gameId }),
          });

          const data = await response.json();

          // Handle Error (e.g. "Not in word list")
          if (!response.ok) {
            alert(data.error);
            return;
          }

          // Handle Success
          const rowStatus = data.result;

          // Update UI Board
          const newTileStatus = [...tileStatus];
          newTileStatus[currentRow] = rowStatus;
          setTileStatus(newTileStatus);

          // Update Keyboard Colors
          setKeyStatus(prev => {
            const newKeys = { ...prev };
            currentGuessArr.forEach((letter, index) => {
              const status = rowStatus[index];
              const current = newKeys[letter];
              if (status === 'correct') newKeys[letter] = 'correct';
              else if (status === 'present' && current !== 'correct') newKeys[letter] = 'present';
              else if (status === 'absent' && current !== 'correct' && current !== 'present') newKeys[letter] = 'absent';
            });
            return newKeys;
          });

          // Check Win/Loss
          // Inside handleKeyPress in your Home component
        if (data.gameStatus === 'won') {
            setGameState('won');
          setTimeout(() => alert(`🎉 You Won! The word was ${data.solution}`), 100);
        } else if (currentRow === 5) {
          setGameState('lost');
         // Revealed solution comes directly from the server data
         setTimeout(() => alert(`Game Over! 😭 The word was: "${data.solution.toUpperCase()}"`), 100);
        } else {
        setCurrentRow(prev => prev + 1);
        setCurrentCol(0);
      }

        } catch (error) {
          console.error("API call failed", error);
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
  }, [board, currentCol, currentRow, gameState, gameId, tileStatus,isProcessing]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === 'Enter') handleKeyPress('Enter');
      else if (key === 'Backspace') handleKeyPress('⌫');
      else if (/^[a-zA-Z]$/.test(key)) handleKeyPress(key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Styling
  const getCellClassName = (rowIndex: number, colIndex: number) => {
    const status = tileStatus[rowIndex][colIndex];
    const letter = board[rowIndex][colIndex];
    let classes = "size-12 border-2 flex items-center justify-center text-xl font-bold uppercase transition-all duration-150 ";
    
    if (rowIndex === currentRow && colIndex === Math.min(currentCol, 4) && gameState === 'playing') {
      return classes + "border-blue-500 ";
    }
    if (status === 'correct') return classes + "bg-green-500 text-white border-green-500";
    if (status === 'present') return classes + "bg-yellow-500 text-white border-yellow-500";
    if (status === 'absent') return classes + "bg-gray-500 text-white border-gray-500";
    if (letter) return classes + "border-gray-600";
    return classes + "border-gray-400";
  };

  return (
    <section className="flex flex-col items-center min-h-screen">
      <h1 className="text-3xl font-bold my-3 md:my-5 w-full text-center">WORDLE</h1>
      
      <div className="grid gap-2 ">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {row.map((letter, colIndex) => (
              <div key={colIndex} className={getCellClassName(rowIndex, colIndex)}>
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>



      <div>
        <button
          onClick={(e) => {
            e.currentTarget.blur();
            getHint();
          }}
          disabled={gameState !== 'playing' || hintUsed || currentRow < 3}
          className={`
            px-6 py-2 rounded-lg font-bold shadow transition-all duration-200
            ${gameState === 'playing' && currentRow >= 3 && !hintUsed
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'}
          `}
        >
          {hintUsed 
            ? "Hint Used" 
            : currentRow < 3 
              ? `Hint (Unlocks round 4)` 
              : "💡 Get Hint"}
        </button>

        <button
        onClick={(e) => {
          if (e.detail === 0) return; // Ignore Enter key press on button
          e.currentTarget.blur(); // Remove focus so keyboard works for game
          startNewGame();
        }}
        className="m-5 md:m-7 px-6 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-colors duration-200"
      >
        Restart Game
      </button>
      </div>
    
      <Keyboard onKeyPress={handleKeyPress} keyStatus={keyStatus} />

    </section>
  );
}