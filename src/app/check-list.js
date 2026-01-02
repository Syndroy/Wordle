// const fs = require('fs');

// try {
//   // 1. Load the file
//   const wordList = require('./wordlist.json');

//   console.log(`\n Checking ${wordList.length} words in wordlist.json...`);

//   // 2. Find words that are NOT 5 letters
//   const invalidWords = wordList.filter(word => word.length !== 5);

//   // 3. Report results
//   if (invalidWords.length > 0) {
//     console.error(`\n❌ Found ${invalidWords.length} words that are NOT 5 letters:`);
//     console.log(invalidWords); 
//   } else {
//     console.log("\n✅ Success! Every word is exactly 5 letters long.");
//   }

// } catch (error) {
//   console.error("\n Error: Could not find or read 'wordlist.json'. Make sure it is in this folder.");
// }


