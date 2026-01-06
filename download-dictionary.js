const fs = require('fs');

async function setupDictionary() {
  console.log("Downloading dictionary...");
  const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words.txt');
  const text = await response.text();
  
  console.log("Filtering words...");
  const allWords = text.split('\n');
  
  // Filter: Exactly 5 letters AND only A-Z (no hyphens, dots, or numbers)
  const filtered = allWords
    .map(word => word.trim().toLowerCase())
    .filter(word => /^[a-z]{5}$/.test(word));

  // Remove duplicates
  const uniqueWords = [...new Set(filtered)];

  // Save to your api folder
  fs.writeFileSync('./src/app/api/game/dictionary.json', JSON.stringify(uniqueWords));
  
  console.log(`✅ Success! Saved ${uniqueWords.length} valid 5-letter words to dictionary.json`);
}

setupDictionary();