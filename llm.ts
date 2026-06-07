import { OpenAI } from 'openai';
import { runToolByName, tools } from './tools/base.ts';
import { config } from './config.ts';

const client = new OpenAI({
  baseURL: config.llm.baseUrl,
  apiKey: config.llm.apiKey,
});

export async function callLLM(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
  process.stdout.write('Agent: thinking...');

  while (true) {
    const { content, toolCalls, didStartResponse } = await streamCompletion(messages);

    if (!content && toolCalls.length === 0) {
      return '(no response)';
    }
    messages.push({
      role: 'assistant',
      content,
      ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
    });

    if (toolCalls.length === 0) {
      process.stdout.write('\n');
      return content || '(no response)';
    }

    const toolResults = await executeToolCalls(toolCalls, content, didStartResponse);
    messages.push(...toolResults);
  }
}

type PendingToolCall = OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall;
type StreamResult = {
  content: string;
  toolCalls: PendingToolCall[];
  didStartResponse: boolean;
};

async function streamCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<StreamResult> {
  const stream = await client.chat.completions.create({
    model: config.llm.model,
    messages,
    tools: tools.map((tool) => tool.schema),
    tool_choice: 'auto',
    stream: true,
  });

  let content = '';
  let didStartResponse = false;
  const toolCalls: PendingToolCall[] = [];

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      if (!didStartResponse) {
        if (!delta.content.trim()) continue;
        process.stdout.clearLine?.(0);
        process.stdout.cursorTo?.(0);
        process.stdout.write('Agent: ');
        didStartResponse = true;
      }
      process.stdout.write(delta.content);
      content += delta.content;
    }

    for (const toolCallDelta of delta.tool_calls ?? []) {
      const index = toolCallDelta.index;
      const toolCall = toolCalls[index] ?? {
        id: '',
        type: 'function' as const,
        function: { name: '', arguments: '' },
      };

      toolCall.id ||= toolCallDelta.id ?? '';
      toolCall.function.name += toolCallDelta.function?.name ?? '';
      toolCall.function.arguments += toolCallDelta.function?.arguments ?? '';
      toolCalls[index] = toolCall;
    }
  }

  return { content, toolCalls, didStartResponse };
}

async function executeToolCalls(
  toolCalls: PendingToolCall[],
  content: string,
  didStartResponse: boolean,
): Promise<OpenAI.Chat.Completions.ChatCompletionToolMessageParam[]> {
  const results: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];

  for (let i = 0; i < toolCalls.length; i++) {
    const tc = toolCalls[i]!;
    const name = tc.function.name;
    const args = JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>;

    if (i === 0) {
      if (didStartResponse) {
        const separator = content.endsWith('\n') ? '' : '\n';
        process.stdout.write(separator);
      } else {
        process.stdout.write('\r\x1b[2K');
      }
    }

    process.stdout.write(`[tool] ${name}(${JSON.stringify(args)})\n`);

    const result = await runToolByName(name, args);
    results.push({ role: 'tool', tool_call_id: tc.id, content: result });
  }

  process.stdout.write('Agent: thinking...');
  return results;
}
