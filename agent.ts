import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { callLLM } from './llm.ts';

// ─── Main REPL ───────────────────────────────────────────────────────────────
async function main() {
  console.log('Welcome to our AI Coding Harness REPL!');

  const rl = readline.createInterface({ input: stdin, output: stdout });
  let userInput: string;

  while (true) {
    try {
      userInput = await rl.question('You: ');
    } catch {
      console.log('\nGoodbye!');
      rl.close();
      break;
    }
    await callLLM(userInput);
  }
}

main();
