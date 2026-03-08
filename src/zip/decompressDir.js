import { createReadStream, createWriteStream } from "fs";
import { promises as fs } from "fs";
import { pipeline, Transform } from "stream";
import { promisify } from "util";
import zlib from "zlib";
import path from "path";

function createExtractor(outputDir) {
  let currentStream = null;
  let buffer = Buffer.alloc(0);

  async function ensureDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }

  function writeHeader(header) {
    const rel = header.slice(5);
    const outPath = path.join(outputDir, rel);
    currentStream = createWriteStream(outPath);
  }

  return new Transform({
    async transform(chunk, _encoding, callback) {
      buffer = Buffer.concat([buffer, chunk]);

      try {
        while (true) {
          if (!currentStream) {
            const idx = buffer.indexOf("\n");
            if (idx === -1) break;
            const header = buffer.slice(0, idx).toString();
            if (!header.startsWith("FILE:")) {
              throw new Error("Invalid archive format");
            }
            await ensureDir(path.join(outputDir, header.slice(5)));
            writeHeader(header);
            buffer = buffer.slice(idx + 1);
          }

          const nextHeader = buffer.indexOf("\nFILE:");
          if (nextHeader !== -1) {
            const content = buffer.slice(0, nextHeader);
            currentStream.write(content);
            currentStream.end();
            currentStream = null;
            buffer = buffer.slice(nextHeader + 1);
            continue;
          } else {
            const keep = 6;
            if (buffer.length > keep) {
              const writeBuf = buffer.slice(0, buffer.length - keep);
              currentStream.write(writeBuf);
              buffer = buffer.slice(buffer.length - keep);
            }
            break;
          }
        }
        callback();
      } catch (err) {
        callback(err);
      }
    },
    flush(callback) {
      if (currentStream) {
        if (buffer.length) currentStream.write(buffer);
        currentStream.end();
      }
      callback();
    }
  });
}

const decompressDir = async () => {
  const rootPath = "workspace";
  const compressedDir = path.join(rootPath, "compressed");
  const archiveFile = path.join(compressedDir, "archive.br");
  const destDir = path.join(rootPath, "decompressed");
  const pipe = promisify(pipeline);

  try {
    await fs.access(archiveFile);
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(destDir, { recursive: true });

  const extractor = createExtractor(destDir);

  await pipe(
    createReadStream(archiveFile),
    zlib.createBrotliDecompress(),
    extractor
  );
  console.log("Directory has been decompressed");
};

await decompressDir();
