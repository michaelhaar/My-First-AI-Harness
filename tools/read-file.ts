import * as fs from 'fs';
import * as path from 'path';
import type { Tool } from './base.ts';

export const readFileTool: Tool = {
  schema: {
    type: 'function',
    function: {
      name: 'read',
      description:
        'Read the contents of a file. ' +
        'For text files, defaults to first 2000 lines. Use offset/limit for large files.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the file to read (relative or absolute)' },
          offset: { type: 'number', description: 'Line number to start reading from (1-indexed)' },
          limit: { type: 'number', description: 'Maximum number of lines to read' },
        },
        required: ['path'],
      },
    },
  },
  handler: async ({ path: filePath, offset, limit }: any) => {
    const abs = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(abs)) return `Error: file not found — ${filePath}`;

    const stat = fs.statSync(abs);
    if (stat.isDirectory()) return `Error: ${filePath} is a directory, not a file`;

    const raw = fs.readFileSync(abs, 'utf8');
    const lines = raw.split('\n');

    const start = offset != null ? Math.max(1, Number(offset)) : 1;
    const end = limit != null ? Math.min(lines.length, start + Number(limit) - 1) : Math.min(lines.length, 2000);

    const slice = lines.slice(start - 1, end);
    const header = `// ${filePath}  (lines ${start}-${end} of ${lines.length})\n`;
    return header + slice.join('\n');
  },
};
