import fs from 'fs';
import fsPromises from 'fs/promises';
import crypto from 'crypto';
import path from 'path';

const verify = async () => {
   const checksumsPath = path.resolve('workspace/checksums.json');

  try {
    await fsPromises.access(checksumsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const raw = await fsPromises.readFile(checksumsPath, 'utf8');
  const checksums = JSON.parse(raw);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const hash = crypto.createHash('sha256');
    const filePath = path.resolve(filename);

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath);

      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const actualHash = hash.digest('hex');
    
    if (actualHash === expectedHash) {
      console.log(`${filename} — OK`);
    } else {
      console.log(`${filename} — FAIL`);
    }
  }
}

await verify();
