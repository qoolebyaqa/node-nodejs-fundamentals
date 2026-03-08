import fs from 'fs/promises';
import os from 'os';
import { Worker } from 'worker_threads';

function splitIntoChunks(arr, n) {
  const chunkSize = Math.ceil(arr.length / n);
  const chunks = [];

  for (let i = 0; i < n; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(arr.slice(start, end));
  }

  return chunks;
}

function mergeSortedArrays(arrays) {
  const k = arrays.length;
  const indexes = new Array(k).fill(0);
  const result = [];

  while (true) {
    let minValue = Infinity;
    let minArray = -1;

    for (let i = 0; i < k; i++) {
      if (indexes[i] < arrays[i].length) {
        const value = arrays[i][indexes[i]];
        if (value < minValue) {
          minValue = value;
          minArray = i;
        }
      }
    }

    if (minArray === -1) break;

    result.push(minValue);
    indexes[minArray]++;
  }

  return result;
}

async function main() {
  const file = await fs.readFile('workspace/data.json', 'utf-8');
  const numbers = JSON.parse(file);

  const cpuCount = os.cpus().length;

  const chunks = splitIntoChunks(numbers, cpuCount);

  const workers = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: chunk
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
      });
    });
  });

  const sortedChunks = await Promise.all(workers);

  const finalSorted = mergeSortedArrays(sortedChunks);

  console.log(finalSorted);
}

await main();