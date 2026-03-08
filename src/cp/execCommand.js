import { spawn } from 'child_process';

export function execCommand() {
  const command = process.argv[2];

  if (!command) {
    console.error('No command provided');
    process.exit(1);
  }

  const child = spawn(command, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    process.exit(code);
  });

  child.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
}

execCommand();