import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

// ─── Main REPL ───────────────────────────────────────────────────────────────
async function main() {
  console.log('Welcome to our AI Coding Harness REPL!');

  const rl = readline.createInterface({ input: stdin, output: stdout });

  while (true) {
    const userInput = await rl.question('User: ');
    console.log(`Agent: ${userInput}`);
  }
}

main();
