// DUSHOOD — logging & debug (phase 69)
const buffer = [];
const MAX = 300;

function push(level, args) {
  const line = `[${new Date().toISOString()}] [${level}] ${args.map(a => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === 'object') { try { return JSON.stringify(a); } catch { return String(a); } }
    return String(a);
  }).join(' ')}`;
  buffer.push(line);
  if (buffer.length > MAX) buffer.shift();
  return line;
}

export const Log = {
  debug(...a) { push('DEBUG', a); },
  info(...a) { push('INFO', a); if (typeof console !== 'undefined') console.info('[Dushood]', ...a); },
  warn(...a) { push('WARN', a); if (typeof console !== 'undefined') console.warn('[Dushood]', ...a); },
  error(...a) { push('ERROR', a); if (typeof console !== 'undefined') console.error('[Dushood]', ...a); },
  dump() { return buffer.join('\n'); },
  clear() { buffer.length = 0; },
};

// Capture globale des erreurs — le jeu doit échouer proprement (phase 97)
export function installGlobalErrorHandlers(onFatal) {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    Log.error('window.error', e.message, e.filename, e.lineno);
    if (onFatal) onFatal(e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    Log.error('unhandledrejection', e.reason);
    if (onFatal) onFatal(String(e.reason));
  });
}
