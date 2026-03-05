import fs from 'fs';
import readline from 'readline';

const args = process.argv.slice(2);
const linesIndex = args.indexOf('--lines');

const maxLines =
  linesIndex !== -1 && args[linesIndex + 1]
    ? Number(args[linesIndex + 1])
    : 10;

async function split() {
  const input = fs.createReadStream('src/streams/files/source.txt');

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity
  });

  let fileIndex = 1;
  let lineCount = 0;
  let output = fs.createWriteStream(`src/streams/files/chunk_${fileIndex}.txt`);

  for await (const line of rl) {
    if (lineCount >= maxLines) {
      output.end();
      fileIndex++;
      lineCount = 0;
      output = fs.createWriteStream(`src/streams/files/chunk_${fileIndex}.txt`);
    }

    output.write(line + '\n');
    lineCount++;
  }

  output.end();
}

await split();