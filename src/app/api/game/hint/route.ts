// src/app/api/game/hint/route.ts
import { NextResponse } from 'next/server';
import { WORDS } from '../words'; // Import from the parent folder

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, guesses } = body; // Client sends ID and past guesses

    // 1. Validation
    if (typeof gameId !== 'number' || !WORDS[gameId]) {
      return NextResponse.json({ error: "Invalid Game ID" }, { status: 400 });
    }
    
    const solution = WORDS[gameId];
    const solutionChars = solution.split('');

    // 2. Determine which slots are ALREADY Green (Solved)
    // We assume all slots are unsolved (false) initially
    const solvedIndices = [false, false, false, false, false];

    // Check every guess the user made
    guesses.forEach((guess: string) => {
      const guessChars = guess.split('');
      guessChars.forEach((letter, index) => {
        // If they ever found the right letter in the right spot, mark it solved
        if (letter === solutionChars[index]) {
          solvedIndices[index] = true;
        }
      });
    });

    // 3. Find the first slot that is NOT solved
    let hintIndex = -1;
    let hintLetter = '';

    for (let i = 0; i < 5; i++) {
      if (!solvedIndices[i]) {
        hintIndex = i;
        hintLetter = solutionChars[i];
        break; // Stop after finding the first missing letter
      }
    }

    // 4. Return the Hint
    if (hintIndex === -1) {
      return NextResponse.json({ message: "You have already found all letters!" });
    }

    return NextResponse.json({ 
      index: hintIndex, 
      letter: hintLetter 
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}