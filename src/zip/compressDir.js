import { createReadStream, createWriteStream } from "fs";
import { promises as fs } from "fs";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import zlib from "zlib";
import path from "path";

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

const compressDir = async () => {
  const rootPath = "workspace";
  const sourceDir = path.join(rootPath, "toCompress");
  const destDir = path.join(rootPath, "compressed");
  const archiveName = "archive.br";
  const pipe = promisify(pipeline);

  try {
    await fs.access(sourceDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(destDir, { recursive: true });

  const files = await collectFiles(sourceDir);

  const archiveStream = Readable.from((async function* () {
    for (const fullPath of files) {
      const relPath = path.relative(sourceDir, fullPath);
      yield Buffer.from(`FILE:${relPath}\n`);
      const fileStream = createReadStream(fullPath);
      for await (const chunk of fileStream) {
        yield chunk;
      }
      yield Buffer.from("\n");
    }
  })());

  const brotli = zlib.createBrotliCompress();
  const destination = createWriteStream(path.join(destDir, archiveName));

  await pipe(archiveStream, brotli, destination);
  console.log("Directory has been compressed");
};

await compressDir();
