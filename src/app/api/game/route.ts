// src/app/api/game/route.ts
import { NextResponse } from 'next/server';
import { WORDS } from './words'; 
import dictionary from './dictionary.json';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guess, gameId } = body;

    if (typeof gameId !== 'number' || gameId < 0 || gameId >= WORDS.length) {
      return NextResponse.json({ error: "Invalid Game ID" }, { status: 400 });
    }

    const solution = WORDS[gameId].toLowerCase();
    const formattedGuess = guess.toLowerCase();

    // STRICT VALIDATION: Exactly 5 letters, alphabetic only, exists in dictionary
    const isFiveLetters = /^[a-z]{5}$/.test(formattedGuess);
    const inDictionary = dictionary.includes(formattedGuess);

    if (!isFiveLetters || !inDictionary) {
      return NextResponse.json({ 
        error: "Not a valid 5-letter word" 
      }, { status: 400 });
    }

    const resultColors = getWordStatus(formattedGuess.split(''), solution);
    const isWin = formattedGuess === solution;

    return NextResponse.json({ 
      result: resultColors, 
      gameStatus: isWin ? 'won' : 'playing',
      solution: solution // Send solution so frontend can show it on loss/win
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}