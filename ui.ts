import { inspect, styleText } from 'node:util';
import { stdout } from 'node:process';
import { performance } from 'node:perf_hooks';
import { config } from './config.ts';

const canStyle = config.ui.color && stdout.isTTY;

function format(style: Parameters<typeof styleText>[0], text: string): string {
  return canStyle ? styleText(style, text) : text;
}

export function clearLine(): void {
  if (stdout.isTTY) {
    stdout.clearLine(0);
    stdout.cursorTo(0);
    return;
  }

  stdout.write('\r\x1b[2K');
}

export function thinking(): void {
  stdout.write(format('dim', 'Agent: thinking...'));
}

export function startAgentResponse(): void {
  clearLine();
  stdout.write(`${format('bold', 'Agent:')} `);
}

export function startReasoning(): void {
  clearLine();
  stdout.write(`${format('dim', '[Reasoning]')} `);
}

export function toolStart(name: string, args: Record<string, unknown>): number {
  stdout.write(`${format('cyan', '[tool]')} ${name}(${summarizeArgs(args)})\n`);
  return performance.now();
}

export function toolEnd(name: string, startedAt: number): void {
  const durationMs = Math.round(performance.now() - startedAt);
  stdout.write(`${format('dim', `[tool] ${name} done in ${durationMs}ms`)}\n`);
}

export function toolError(name: string, startedAt: number, error: unknown): void {
  const durationMs = Math.round(performance.now() - startedAt);
  stdout.write(`${format('red', `[tool] ${name} failed in ${durationMs}ms:`)} ${String(error)}\n`);
}

function summarizeArgs(args: Record<string, unknown>): string {
  if (config.ui.debugTools) {
    return inspect(args, { colors: canStyle, depth: 4, breakLength: 120 });
  }

  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    summary[key] = summarizeValue(key, value);
  }

  return inspect(summary, { colors: canStyle, depth: 2, breakLength: 120 });
}

function summarizeValue(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value;

  if (['content', 'oldText', 'newText'].includes(key)) {
    return `<${value.length} chars>`;
  }

  if (value.length <= config.ui.maxToolPreviewChars) return value;
  return `${value.slice(0, config.ui.maxToolPreviewChars)}... <${value.length} chars>`;
}
