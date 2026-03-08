import { parentPort, workerData } from 'worker_threads';

function sortNumbers(numbers) {
  return numbers.slice().sort((a, b) => a - b);
}

const sorted = sortNumbers(workerData);
parentPort.postMessage(sorted);
