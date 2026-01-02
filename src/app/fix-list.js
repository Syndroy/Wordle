// const fs = require('fs');
// const path = require('path');

// // Target the file in the same directory
// const filePath = path.join(__dirname, 'wordlist.json');

// try {
//   // 1. Read the current list
//   const wordList = require(filePath);
//   const originalCount = wordList.length;

//   // 2. Filter: Keep ONLY words with exactly 5 letters
//   const cleanList = wordList.filter(word => word.length === 5);
//   const removedCount = originalCount - cleanList.length;

//   // 3. Save if changes were made
//   if (removedCount > 0) {
//     fs.writeFileSync(filePath, JSON.stringify(cleanList, null, 2));
    
//     console.log(`\n✅ FIXED! Removed ${removedCount} invalid words.`);
//     console.log(`📊 Old count: ${originalCount}`);
//     console.log(`📊 New count: ${cleanList.length}`);
//   } else {
//     console.log("\n👍 File is already clean. No changes needed.");
//   }

// } catch (error) {
//   console.error("Error:", error.message);
// }