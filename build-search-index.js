// To run this script, execute: node build-search-index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all directories in the current folder that contain a SUMMARY.md
const getBookDirs = () => {
  return fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map(dirent => dirent.name)
    .filter(name => fs.existsSync(path.join(__dirname, name, 'SUMMARY.md')));
};

const books = getBookDirs();

const MIN_NGRAM_LENGTH = 3;
const STOP_WORDS = new Set([
  'the', 'and', 'this', 'that', 'for', 'with', 'from', 'your', 'about',
  'then', 'were', 'have', 'here', 'there', 'their', 'them', 'into',
  'some', 'many', 'such', 'each', 'only', 'than', 'very', 'also', 'what',
  'when', 'where', 'which', 'who', 'how', 'will', 'would', 'should',
  'been', 'being', 'does', 'doing', 'done'
]);

function generatePrefixes(word) {
  const prefixes = new Set();
  if (word.length < MIN_NGRAM_LENGTH) {
    return prefixes;
  }
  for (let i = MIN_NGRAM_LENGTH; i <= word.length; i++) {
    prefixes.add(word.substring(0, i));
  }
  return prefixes;
}

function createIndexForBook(book) {
  const contentDir = path.join(__dirname, book);
  const outputFile = path.join(contentDir, 'search-index.json');
  const summaryPath = path.join(contentDir, 'SUMMARY.md');
  const searchIndex = {};

  fs.readFile(summaryPath, 'utf8', (err, summaryContent) => {
    if (err) {
      console.error(`Could not read SUMMARY.md for '${book}': ${err}`);
      return;
    }

    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    const filesToIndex = [];
    let match;
    while ((match = markdownLinkRegex.exec(summaryContent))) {
      filesToIndex.push({ label: match[1], file: match[2] });
    }

    if (filesToIndex.length === 0) {
      console.log(`No markdown files found in SUMMARY.md for '${book}'.`);
      return;
    }

    let filesProcessed = 0;

    filesToIndex.forEach(({ label, file }) => {
      const filePath = path.join(contentDir, file);
      fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
          console.error(`Error reading file '${file}' from SUMMARY.md: ${err}`);
        } else {
          const words = content.toLowerCase().split(/\s+/);
          const uniqueWords = [...new Set(words)].filter(word => word.trim() !== '');

          uniqueWords.forEach(word => {
            const cleanedWord = word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
            if (cleanedWord.length < MIN_NGRAM_LENGTH || STOP_WORDS.has(cleanedWord)) {
              return;
            }

            const tokens = generatePrefixes(cleanedWord);
            tokens.add(cleanedWord);

            tokens.forEach(token => {
              if (!searchIndex.hasOwnProperty(token)) {
                searchIndex[token] = [];
              }
              if (!searchIndex[token].some(entry => entry.label === label)) {
                searchIndex[token].push({ label, file });
              }
            });
          });
        }

        filesProcessed++;

        if (filesProcessed === filesToIndex.length) {
          fs.writeFile(outputFile, JSON.stringify(searchIndex), err => {
            if (err) {
              console.error(`Error writing search index for '${book}': ${err}`);
            } else {
              console.log(`Search index for '${book}' created at ${outputFile}`);
            }
          });
        }
      });
    });
  });
}

books.forEach(book => {
  createIndexForBook(book);
});
