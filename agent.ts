import * as readline from 'node:readline/promises';
import { cwd, exit, stdin, stdout } from 'node:process';
import { callLLM } from './llm.ts';
import type OpenAI from 'openai';
import { config, systemMessage } from './config.ts';

// ─── Main REPL ───────────────────────────────────────────────────────────────
async function main() {
  console.log('AI Coding Harness');
  console.log(`model: ${config.llm.model}`);
  console.log(`cwd: ${cwd()}`);
  console.log('type /help for commands\n');

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [systemMessage];

  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
    exit(0);
  });

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      console.log('\nGoodbye!');
      rl.close();
      break;
    }

    const input = userInput.trim();
    if (!input) continue;

    if (input === '/exit' || input === '/quit') {
      console.log('Goodbye!');
      rl.close();
      break;
    }

    if (input === '/help') {
      console.log('Commands: /help, /clear, /model, /exit');
      continue;
    }

    if (input === '/clear') {
      history.splice(1);
      console.log('Conversation cleared.');
      continue;
    }

    if (input === '/model') {
      console.log(config.llm.model);
      continue;
    }

    history.push({ role: 'user', content: input });
    try {
      await callLLM(history);
    } catch (error) {
      console.error(`Agent error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

main();
