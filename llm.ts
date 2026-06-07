import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'http://127.0.0.1:8000/v1',
  apiKey: '12345',
});

export async function callLLM(userInput: string): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: userInput,
    },
  ];

  const stream = await client.chat.completions.create({
    model: 'Qwen3.6-35B-A3B-oQ4-fp16-mtp',
    messages,
    stream: true,
  });

  let result = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      process.stdout.write(delta);
      result += delta;
    }
  }
  console.log('\n');
  return result;
}
