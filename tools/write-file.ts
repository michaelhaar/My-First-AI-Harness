import * as fs from 'fs';
import * as path from 'path';
import type { Tool } from './base.ts';

export const writeFileTool: Tool = {
  schema: {
    type: 'function',
    function: {
      name: 'write',
      description:
        "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. " +
        'Automatically creates parent directories.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the file to write (relative or absolute)' },
          content: { type: 'string', description: 'Content to write to the file' },
        },
        required: ['path', 'content'],
      },
    },
  },
  handler: async ({ path: filePath, content }: any) => {
    const abs = path.resolve(process.cwd(), filePath);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });
    await fs.promises.writeFile(abs, content, 'utf8');
    return `Wrote file ${filePath}`;
  },
};
