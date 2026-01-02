// src/app/api/game/route.ts
import { NextResponse } from 'next/server';
import { WORDS } from './words'; // Importing the data on the server

// --- LOGIC HELPER (Hidden from user) ---
const getWordStatus = (guess: string[], solutionStr: string) => {
  const solutionChars = solutionStr.split('');
  const statusArr = Array(5).fill('absent');
  
  // Pass 1: Green
  guess.forEach((letter, i) => {
    if (letter === solutionChars[i]) {
      statusArr[i] = 'correct';
      solutionChars[i] = ''; 
    }
  });

  // Pass 2: Yellow
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

// 1. GET: START NEW GAME (Returns ID only)
export async function GET() {
  const randomIndex = Math.floor(Math.random() * WORDS.length);
  return NextResponse.json({ gameId: randomIndex });
}

// 2. POST: CHECK GUESS (Securely checks logic)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guess, gameId } = body;

    // Validate ID
    if (typeof gameId !== 'number' || gameId < 0 || gameId >= WORDS.length) {
      return NextResponse.json({ error: "Invalid Game ID" }, { status: 400 });
    }

    const solution = WORDS[gameId]; // Retrieve the secret word from server memory

    // Validate Word Exists
    if (!WORDS.includes(guess)) {
      return NextResponse.json({ error: "Not in word list" }, { status: 400 });
    }

    // Calculate Colors
    const resultColors = getWordStatus(guess.split(''), solution);
    const isWin = guess === solution;

    return NextResponse.json({ 
      result: resultColors, 
      gameStatus: isWin ? 'won' : 'playing'
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}