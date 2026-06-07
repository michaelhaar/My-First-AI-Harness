import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { callLLM } from './llm.ts';
import type OpenAI from 'openai';
import { systemMessage } from './config.ts';

// ─── Main REPL ───────────────────────────────────────────────────────────────
async function main() {
  console.log('Welcome to our AI Coding Harness REPL!');

  const rl = readline.createInterface({ input: stdin, output: stdout });
  let userInput: string;
  const history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [systemMessage];

  while (true) {
    try {
      userInput = await rl.question('You: ');
    } catch {
      console.log('\nGoodbye!');
      rl.close();
      break;
    }

    history.push({ role: 'user', content: userInput });
    await callLLM(history);
  }
}

main();
