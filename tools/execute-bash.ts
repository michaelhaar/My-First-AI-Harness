import { execSync } from 'child_process';
import type { Tool } from './base.ts';

export const executeBashTool: Tool = {
  schema: {
    type: 'function',
    function: {
      name: 'execute_bash',
      description:
        'Execute a bash command in the current working directory. Returns stdout ' +
        'and stderr. Optionally provide a timeout in seconds.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The bash command to execute' },
          timeout: { type: 'number', description: 'Timeout in seconds (optional, no default timeout)' },
        },
        required: ['command'],
      },
    },
  },
  handler: async ({ command, timeout }: any) => {
    try {
      return execSync(command, {
        encoding: 'utf8',
        timeout: timeout != null ? Number(timeout) * 1000 : undefined,
      });
    } catch (error: any) {
      return error.stdout ?? error.message;
    }
  },
};
