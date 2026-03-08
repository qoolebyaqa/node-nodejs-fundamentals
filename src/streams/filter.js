import { Transform } from "stream";

const filter = () => {  
  const filterStream = new Transform({
    transform(chunk, _encoding, callback) {
      const line = chunk.toString().trim();
      if (line.includes(process.argv[3])) {
        callback(null, line + '\n');
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
