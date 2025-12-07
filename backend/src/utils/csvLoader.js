// const fs = require('fs');
// const path = require('path');
// const readline = require('readline');

// /**
//  * Parse CSV line handling quoted fields with commas
//  */
// function parseCSVLine(line) {
//   const result = [];
//   let current = '';
//   let inQuotes = false;

//   for (let i = 0; i < line.length; i++) {
//     const char = line[i];
//     const nextChar = line[i + 1];

//     if (char === '"') {
//       if (inQuotes && nextChar === '"') {
//         current += '"';
//         i++;
//       } else {
//         inQuotes = !inQuotes;
//       }
//     } else if (char === ',' && !inQuotes) {
//       result.push(current.trim());
//       current = '';
//     } else {
//       current += char;
//     }
//   }

//   result.push(current.trim());
//   return result;
// }

// /**
//  * Convert CSV to JSON with streaming to handle large files
//  * Uses streaming write to avoid memory issues
//  */
// async function csvToJson(csvFilePath, jsonOutputPath) {
//   return new Promise((resolve, reject) => {
//     const fileStream = fs.createReadStream(csvFilePath);
//     const writeStream = fs.createWriteStream(jsonOutputPath);
    
//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity
//     });

//     let headers = [];
//     let lineCount = 0;
//     let isFirstLine = true;
//     let isFirstRecord = true;

//     // Start JSON array
//     writeStream.write('[\n');

//     rl.on('line', (line) => {
//       if (!line.trim()) return;

//       if (isFirstLine) {
//         headers = parseCSVLine(line);
//         isFirstLine = false;
//         return;
//       }

//       const values = parseCSVLine(line);
//       const record = {};

//       headers.forEach((header, index) => {
//         record[header] = values[index] || '';
//       });

//       // Write record to file immediately
//       if (!isFirstRecord) {
//         writeStream.write(',\n');
//       }
//       writeStream.write('  ' + JSON.stringify(record));
//       isFirstRecord = false;

//       lineCount++;

//       // Log progress every 10000 lines
//       if (lineCount % 10000 === 0) {
//         console.log(`  Processed ${lineCount} records...`);
//       }
//     });

//     rl.on('close', () => {
//       // Close JSON array
//       writeStream.write('\n]');
//       writeStream.end();

//       writeStream.on('finish', () => {
//         console.log(`✓ Converted ${lineCount} records to ${jsonOutputPath}`);
//         console.log(`✓ Fields: ${headers.join(', ')}`);
//         resolve(lineCount);
//       });
//     });

//     rl.on('error', (error) => {
//       console.error('✗ Failed to read CSV:', error.message);
//       writeStream.end();
//       reject(error);
//     });

//     writeStream.on('error', (error) => {
//       console.error('✗ Failed to write JSON:', error.message);
//       reject(error);
//     });
//   });
// }

// // Usage: node src/utils/csvLoader.js
// if (require.main === module) {
//   const csvPath = path.join(__dirname, '../../data/sales.csv');
//   const jsonPath = path.join(__dirname, '../../data/sales.json');
  
//   console.log(`Converting ${csvPath} to ${jsonPath}...`);
//   csvToJson(csvPath, jsonPath)
//     .then(() => console.log('✓ Conversion complete!'))
//     .catch((err) => console.error('✗ Conversion failed:', err.message));
// }

// module.exports = { csvToJson };



// const fs = require('fs');
// const path = require('path');
// const readline = require('readline');
// const fetch = require('node-fetch');

// /**
//  * Parse CSV line handling quoted fields with commas
//  */
// function parseCSVLine(line) {
//   const result = [];
//   let current = '';
//   let inQuotes = false;

//   for (let i = 0; i < line.length; i++) {
//     const char = line[i];
//     const nextChar = line[i + 1];

//     if (char === '"') {
//       if (inQuotes && nextChar === '"') {
//         current += '"';
//         i++;
//       } else {
//         inQuotes = !inQuotes;
//       }
//     } else if (char === ',' && !inQuotes) {
//       result.push(current.trim());
//       current = '';
//     } else {
//       current += char;
//     }
//   }

//   result.push(current.trim());
//   return result;
// }

// /**
//  * Downloads CSV from Google Drive with confirmation token support
//  */
// async function downloadCSV(url, dest) {
//   console.log("📦 Downloading CSV from Google Drive...");

//   let res = await fetch(url);
//   let text = await res.text();

//   // Detect confirmation token (Google Drive anti-bot response)
//   const match = text.match(/confirm=([0-9A-Za-z_]+)/);

//   if (match) {
//     const confirmURL = `${url}&confirm=${match[1]}`;
//     console.log("⚠ Google blocked direct download — retrying with token...");
//     res = await fetch(confirmURL);
//   } else {
//     res = await fetch(url);
//   }

//   const buffer = Buffer.from(await res.arrayBuffer());

//   fs.writeFileSync(dest, buffer);
//   console.log(`✔ CSV downloaded (${buffer.length.toLocaleString()} bytes)`);
// }

// /**
//  * Converts CSV to JSON without loading file into memory
//  */
// async function csvToJson(csvFilePath, jsonOutputPath) {
//   return new Promise((resolve, reject) => {
//     const fileStream = fs.createReadStream(csvFilePath);
//     const writeStream = fs.createWriteStream(jsonOutputPath);

//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity
//     });

//     let headers = [];
//     let lineCount = 0;
//     let isFirstLine = true;
//     let isFirstRecord = true;

//     writeStream.write('[\n');

//     rl.on('line', (line) => {
//       if (!line.trim()) return;

//       if (isFirstLine) {
//         headers = parseCSVLine(line);
//         isFirstLine = false;
//         return;
//       }

//       const values = parseCSVLine(line);
//       const record = {};

//       headers.forEach((header, index) => {
//         record[header] = values[index] || '';
//       });

//       if (!isFirstRecord) writeStream.write(',\n');
//       writeStream.write('  ' + JSON.stringify(record));
//       isFirstRecord = false;

//       lineCount++;
//       if (lineCount % 10000 === 0) console.log(`  Processed ${lineCount.toLocaleString()} records...`);
//     });

//     rl.on('close', () => {
//       writeStream.write('\n]');
//       writeStream.end();

//       writeStream.on('finish', () => {
//         console.log(`✔ JSON created with ${lineCount.toLocaleString()} records`);
//         resolve(lineCount);
//       });
//     });

//     rl.on('error', reject);
//     writeStream.on('error', reject);
//   });
// }

// /**
//  * Ensures dataset exists and is processed
//  */
// async function ensureDataset() {
//   const dataDir = path.join(process.cwd(), 'data');
//   const csvPath = path.join(dataDir, 'sales.csv');
//   const jsonPath = path.join(dataDir, 'sales.json');

//   if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

//   // Download if missing
//   if (!fs.existsSync(csvPath)) {
//     if (!process.env.DATA_URL) throw new Error("DATA_URL missing in environment variables");
//     await downloadCSV(process.env.DATA_URL, csvPath);
//   }

//   // Convert if JSON missing
//   if (!fs.existsSync(jsonPath)) {
//     console.log("⚙ Converting CSV → JSON...");
//     await csvToJson(csvPath, jsonPath);
//   }

//   return jsonPath;
// }

// /**
//  * Load JSON into memory
//  */
// async function loadSalesData() {
//   const jsonPath = await ensureDataset();
//   console.log("📄 Loading JSON data...");
//   const raw = fs.readFileSync(jsonPath, 'utf-8');
//   return JSON.parse(raw);
// }

// module.exports = { loadSalesData };








const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

let cachedJSON = null;

/**
 * Downloads JSON from GitHub Raw URL and stores it locally (only once)
 */
async function downloadJSON(url, dest) {
  console.log("📦 Downloading JSON...");

  const res = await fetch(url);

  if (!res.ok) throw new Error(`Failed to download JSON: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);

  console.log(`✔ JSON downloaded (${buffer.length.toLocaleString()} bytes)`);
}

/**
 * Ensures dataset exists locally OR downloads it
 */
async function ensureDataset() {
  const dataDir = path.join(process.cwd(), "data");
  const jsonPath = path.join(dataDir, "sales.json");

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  // If the file doesn't exist locally, download it from GitHub
  if (!fs.existsSync(jsonPath)) {
    if (!process.env.DATA_URL) throw new Error("DATA_URL environment variable missing");
    await downloadJSON(process.env.DATA_URL, jsonPath);
  }

  return jsonPath;
}

/**
 * Loads JSON file and caches it in memory
 */
async function loadSalesData() {
  if (cachedJSON) return cachedJSON;

  const jsonPath = await ensureDataset();
  console.log("📄 Loading JSON into memory...");

  const raw = fs.readFileSync(jsonPath, "utf8");
  cachedJSON = JSON.parse(raw);

  console.log(`✔ Loaded ${cachedJSON.length.toLocaleString()} records`);
  return cachedJSON;
}

module.exports = { loadSalesData };
