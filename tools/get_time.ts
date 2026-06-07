import type { Tool } from './base.ts';

export const getTimeTool: Tool = {
  schema: {
    type: 'function',
    function: {
      name: 'get_time',
      description: 'Return the current time in ISO format.',
      parameters: { type: 'object', properties: {} },
    },
  },
  handler: async () => new Date().toISOString(),
};
