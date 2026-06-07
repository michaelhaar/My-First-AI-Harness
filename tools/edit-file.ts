import * as fs from 'fs';
import * as path from 'path';
import type { Tool } from './base.ts';

export const editFileTool: Tool = {
  schema: {
    type: 'function',
    function: {
      name: 'edit_file',
      description:
        'Edit a file by replacing exact text. The oldText must match exactly ' +
        '(including whitespace). Use this for precise, surgical edits.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the file to edit (relative or absolute)' },
          oldText: { type: 'string', description: 'Exact text to find and replace (must match exactly)' },
          newText: { type: 'string', description: 'New text to replace the old text with' },
        },
        required: ['path', 'new_content', 'start_line', 'end_line'],
      },
    },
  },

  handler: async ({ path: filePath, oldText, newText }: any) => {
    const abs = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(abs)) return `Error: file not found — ${filePath}`;

    const stat = fs.statSync(abs);
    if (stat.isDirectory()) return `Error: ${filePath} is a directory, not a file`;

    const raw = fs.readFileSync(abs, 'utf8');

    if (!raw.includes(oldText)) {
      return `Error: oldText not found in file — ${filePath}`;
    }

    const newContent = raw.replace(oldText, newText);
    fs.writeFileSync(abs, newContent, 'utf8');

    return `Edited file ${filePath}`;
  },
};
