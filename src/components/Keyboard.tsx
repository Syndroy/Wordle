import React from 'react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-8 mb-8">
      {keyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((key, keyIndex) => (
            <button
              key={keyIndex}
              onClick={() => onKeyPress(key)}
              className={`px-3 py-3 rounded font-bold text-lg border-blue-900 border-2  uppercase hover:bg-gray-300 active:bg-gray-400 transition-colors ${
                key === "Enter" || key === "⌫" ? "px-4" : ""
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
