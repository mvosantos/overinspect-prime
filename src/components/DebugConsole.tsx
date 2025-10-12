import { useEffect, useState } from 'react';
import debugLogger from '../utils/debugLogger';

export default function DebugConsole() {
  const [entries, setEntries] = useState(debugLogger.getLogs());

  useEffect(() => {
    const unsub = debugLogger.subscribeLogs((e) => setEntries((prev) => [...prev.slice(-999), e]));
    return () => { void unsub(); };
  }, []);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(entries.map((e) => `[${new Date(e.time).toISOString()}] ${e.level.toUpperCase()} ${e.message}`).join('\n'));
      alert('Logs copiados para a área de transferência');
    } catch {
      alert('Não foi possível copiar os logs');
    }
  };

  if (entries.length === 0) return null;

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, width: 640, maxHeight: '40vh', overflow: 'auto', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: 12, zIndex: 9999, fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>Debug Console (dev)</div>
        <div>
          <button onClick={() => debugLogger.clearLogs()} style={{ marginRight: 8 }}>Clear</button>
          <button onClick={copyAll}>Copy</button>
        </div>
      </div>
      <div>
        {entries.slice().reverse().map((e, i) => (
          <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
            <div style={{ color: '#9ca3af' }}>{new Date(e.time).toLocaleTimeString()}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{e.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
