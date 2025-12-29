// import React from 'react';

// interface KeyboardProps {
//   onKeyPress: (key: string) => void;
// }

// const keyboard = [
//   ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
//   ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
//   ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
// ];

// const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
//   return (
//     <div className="flex flex-col items-center gap-2 mt-8 mb-8">
//       {keyboard.map((row, rowIndex) => (
//         <div key={rowIndex} className="flex gap-2">
//           {row.map((key, keyIndex) => (
//             <button
//               key={keyIndex}
//               onClick={() => onKeyPress(key)}
//               className={`px-3 py-3 rounded font-bold text-lg border-blue-900 border-2  uppercase hover:bg-gray-300 active:bg-gray-400 transition-colors ${
//                 key === "Enter" || key === "⌫" ? "px-4" : ""
//               }`}
//             >
//               {key}
//             </button>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Keyboard;

import React from 'react';

type TileStatus = 'correct' | 'present' | 'absent' | '';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStatus: Record<string, TileStatus>; // NEW PROP
}

const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, keyStatus }) => {
  
  const getKeyStyle = (key: string) => {
    const status = keyStatus[key];
    const base = "rounded font-bold text-sm md:text-base uppercase transition-colors h-14 flex items-center justify-center";
    const width = key === "Enter" || key === "⌫" ? "w-16 px-1" : "w-10 px-2";
    
    let color = "bg-gray-200 hover:bg-gray-300 text-black"; // Default
    
    if (status === 'correct') color = "bg-green-500 text-white border-green-600";
    else if (status === 'present') color = "bg-yellow-500 text-white border-yellow-600";
    else if (status === 'absent') color = "bg-gray-500 text-white border-gray-600";

    return `${base} ${width} ${color}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={getKeyStyle(key)}
            >
              {key === "⌫" ? (
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier"strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 9L13.0001 11.9999M13.0001 11.9999L10 15M13.0001 11.9999L10.0002 9M13.0001 11.9999L16.0002 15M8 6H19C19.5523 6 20 6.44772 20 7V17C20 17.5523 19.5523 18 19 18H8L2 12L8 6Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              ) : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;