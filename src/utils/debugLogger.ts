type LogEntry = { level: 'log' | 'info' | 'warn' | 'error'; message: string; time: number };

const MAX_LOGS = 1000;
const logs: LogEntry[] = [];
const listeners = new Set<(entry: LogEntry) => void>();

function formatArg(a: unknown) {
  try {
    if (typeof a === 'string') return a;
    return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
  } catch {
    return String(a);
  }
}

function push(level: LogEntry['level'], args: unknown[]) {
  const message = args.map(formatArg).join(' ');
  const entry: LogEntry = { level, message, time: Date.now() };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  listeners.forEach((l) => l(entry));
}

export function getLogs() {
  return logs.slice();
}

export function clearLogs() {
  logs.length = 0;
  listeners.forEach((l) => l({ level: 'log', message: '[debugLogger] cleared', time: Date.now() }));
}

export function subscribeLogs(fn: (entry: LogEntry) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Monkey-patch console methods in development only
// Vite exposes import.meta.env.MODE; only enable in non-production
const meta = import.meta as unknown as { env?: { MODE?: string } };
const isDev = (typeof meta.env !== 'undefined') ? (meta.env!.MODE !== 'production') : true;
if (isDev) {
  const origLog = console.log.bind(console);
  const origInfo = console.info.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);

  console.log = (...args: unknown[]) => { origLog(...args); push('log', args); };
  console.info = (...args: unknown[]) => { origInfo(...args); push('info', args); };
  console.warn = (...args: unknown[]) => { origWarn(...args); push('warn', args); };
  console.error = (...args: unknown[]) => { origError(...args); push('error', args); };
}

export default { getLogs, clearLogs, subscribeLogs };
