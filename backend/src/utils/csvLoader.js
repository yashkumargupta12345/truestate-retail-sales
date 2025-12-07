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



const fs = require('fs');
const path = require('path');
const readline = require('readline');
const fetch = require('node-fetch');

/**
 * Parse CSV line handling quoted fields with commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Converts CSV to JSON (streaming so we don’t explode memory)
 */
async function csvToJson(csvFilePath, jsonOutputPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(csvFilePath);
    const writeStream = fs.createWriteStream(jsonOutputPath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let headers = [];
    let lineCount = 0;
    let isFirstLine = true;
    let isFirstRecord = true;

    writeStream.write('[\n');

    rl.on('line', (line) => {
      if (!line.trim()) return;

      if (isFirstLine) {
        headers = parseCSVLine(line);
        isFirstLine = false;
        return;
      }

      const values = parseCSVLine(line);
      const record = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      if (!isFirstRecord) writeStream.write(',\n');
      writeStream.write('  ' + JSON.stringify(record));
      isFirstRecord = false;

      lineCount++;
      if (lineCount % 10000 === 0) console.log(`  Processed ${lineCount} records...`);
    });

    rl.on('close', () => {
      writeStream.write('\n]');
      writeStream.end();

      writeStream.on('finish', () => {
        console.log(`✓ Converted ${lineCount} records → ${jsonOutputPath}`);
        resolve(lineCount);
      });
    });

    rl.on('error', reject);
    writeStream.on('error', reject);
  });
}

/**
 * Ensures dataset exists (download if missing, convert if needed)
 */
async function ensureDataset() {
  const dataDir = path.join(process.cwd(), 'data');
  const csvPath = path.join(dataDir, 'sales.csv');
  const jsonPath = path.join(dataDir, 'sales.json');

  // Create folder if missing
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Download CSV if missing
  if (!fs.existsSync(csvPath)) {
    console.log('📦 CSV missing → downloading from Google Drive...');
    if (!process.env.DATA_URL) throw new Error('DATA_URL environment variable missing');

    const res = await fetch(process.env.DATA_URL);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(csvPath, Buffer.from(buffer));
    console.log('✔ CSV downloaded successfully');
  }

  // Convert CSV → JSON if missing
  if (!fs.existsSync(jsonPath)) {
    console.log('⚙️ Converting CSV to JSON...');
    await csvToJson(csvPath, jsonPath);
    console.log('✔ JSON created successfully');
  }

  return jsonPath;
}

/**
 * Load final JSON data
 */
async function loadSalesData() {
  const jsonPath = await ensureDataset();
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(raw);
}

module.exports = { loadSalesData, csvToJson };
