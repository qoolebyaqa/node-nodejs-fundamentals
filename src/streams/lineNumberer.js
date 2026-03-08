import { Transform } from "stream";

const lineNumberer = () => {
  const transformedStream = new Transform({
    transform(chunk, _encoding, callback) {
      const lines = chunk.toString().split("\\n");
      const prependedNumber = lines.map((line, index) => `${index + 1} | ${line}`).join("\\n");
      callback(null, prependedNumber);
    },
  });

  
  process.stdin.pipe(transformedStream).pipe(process.stdout);
};

lineNumberer();
