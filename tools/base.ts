import type OpenAI from 'openai';
import { editFileTool } from './edit-file.ts';
import { executeBashTool } from './execute-bash.ts';
import { getTimeTool } from './get_time.ts';
import { readFileTool } from './read-file.ts';
import { writeFileTool } from './write-file.ts';

/**
 * A tool is a function + its OpenAI schema definition.
 */
export type Tool = {
  schema: OpenAI.ChatCompletionFunctionTool;
  handler: (args: unknown) => Promise<string>;
};

export const tools: Tool[] = [getTimeTool, readFileTool, writeFileTool, executeBashTool, editFileTool];

export async function runToolByName(name: string, args: unknown): Promise<string> {
  const tool = tools.find((tool) => tool.schema.function.name === name);
  if (!tool) {
    return `Error: No tool found with name "${name}"`;
  }
  return await tool.handler(args);
}
