type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!isDev && level === 'debug') return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  // In production: send to observability endpoint instead of console
  if (!isDev) {
    // TODO: wire to your APM/logging endpoint
    // sendToObservability(entry);
    return;
  }

  const fn = level === 'error' ? console.error
    : level === 'warn' ? console.warn
    : level === 'debug' ? console.debug
    : console.log;

  fn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, meta ?? '');
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
