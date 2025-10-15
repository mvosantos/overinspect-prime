import { useEffect, useState, useCallback, useRef } from 'react';
import debugLogger from '../utils/debugLogger';

export default function DebugConsole() {
  const [entries, setEntries] = useState(debugLogger.getLogs());
  const [visible, setVisible] = useState(false);

  // position & size (px). If movedByUser is false we anchor to bottom-right.
  const [pos, setPos] = useState<{ left?: number; top?: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 640, height: 280 });
  const movedByUserRef = useRef(false);

  useEffect(() => {
    const unsub = debugLogger.subscribeLogs((e) => setEntries((prev) => [...prev.slice(-999), e]));
    return () => { void unsub(); };
  }, []);

  const toggleVisible = useCallback(() => setVisible((v) => !v), []);
  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      try {
        const isModifier = ev.ctrlKey || ev.metaKey;
        if (isModifier && ev.shiftKey && (ev.key === 'D' || ev.key === 'd')) {
          ev.preventDefault();
          toggleVisible();
        }
        if (ev.key === 'Escape') {
          hide();
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleVisible, hide]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(entries.map((e) => `[${new Date(e.time).toISOString()}] ${e.level.toUpperCase()} ${e.message}`).join('\n'));
      alert('Logs copiados para a área de transferência');
    } catch {
      alert('Não foi possível copiar os logs');
    }
  };

  // drag/resize refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; origLeft?: number; origTop?: number } | null>(null);
  const resizeRef = useRef<{ active: boolean; startX: number; startY: number; origW: number; origH: number } | null>(null);

  useEffect(() => {
    const onPointerMove = (ev: PointerEvent) => {
      try {
        if (dragRef.current && dragRef.current.active) {
          ev.preventDefault();
          const dx = ev.clientX - dragRef.current.startX;
          const dy = ev.clientY - dragRef.current.startY;
          movedByUserRef.current = true;
          const left = (dragRef.current.origLeft ?? window.innerWidth - size.width - 12) + dx;
          const top = (dragRef.current.origTop ?? window.innerHeight - size.height - 112) + dy;
          // clamp
          const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - 100));
          const clampedTop = Math.max(8, Math.min(top, window.innerHeight - 40));
          setPos({ left: clampedLeft, top: clampedTop });
        }
        if (resizeRef.current && resizeRef.current.active) {
          ev.preventDefault();
          const dx = ev.clientX - resizeRef.current.startX;
          const dy = ev.clientY - resizeRef.current.startY;
          const newW = Math.max(200, resizeRef.current.origW + dx);
          const newH = Math.max(120, resizeRef.current.origH + dy);
          setSize({ width: Math.min(newW, window.innerWidth - 16), height: Math.min(newH, window.innerHeight - 16) });
        }
      } catch {
        // ignore
      }
    };
    const onPointerUp = () => {
      if (dragRef.current) dragRef.current.active = false;
      if (resizeRef.current) resizeRef.current.active = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [size.width, size.height]);

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const origLeft = pos?.left;
    const origTop = pos?.top;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, origLeft, origTop };
  };

  const onResizePointerDown = (e: React.PointerEvent) => {
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    resizeRef.current = { active: true, startX: e.clientX, startY: e.clientY, origW: size.width, origH: size.height };
  };

  const resetPosition = () => {
    movedByUserRef.current = false;
    setPos(null);
    setSize({ width: 640, height: 280 });
  };

  if (!visible) return null;

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    right: movedByUserRef.current ? undefined : 12,
    bottom: movedByUserRef.current ? undefined : 112,
    left: pos?.left,
    top: pos?.top,
    width: size.width,
    height: size.height,
    maxHeight: '80vh',
    overflow: 'auto',
    background: 'rgba(0,0,0,0.9)',
    color: '#fff',
    padding: 0,
    zIndex: 9999,
    fontSize: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={containerRef} role="dialog" aria-label="Debug Console" style={baseStyle}>
      <div
        onPointerDown={onHeaderPointerDown}
        onDoubleClick={resetPosition}
        style={{ cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTopLeftRadius: 6, borderTopRightRadius: 6, background: 'rgba(0,0,0,0.85)' }}
      >
        <div style={{ fontSize: 13 }}>Debug Console (dev) — atalho: Ctrl/Cmd + Shift + D</div>
        <div>
          <button onClick={() => debugLogger.clearLogs()} style={{ marginRight: 8 }}>Clear</button>
          <button onClick={copyAll} style={{ marginRight: 8 }}>Copy</button>
          <button onClick={hide} style={{ marginRight: 8 }}>Close</button>
        </div>
      </div>
      <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
        {entries.slice().reverse().map((e, i) => (
          <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
            <div style={{ color: '#9ca3af' }}>{new Date(e.time).toLocaleTimeString()}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{e.message}</div>
          </div>
        ))}
      </div>
      {/* resize handle */}
      <div
        onPointerDown={onResizePointerDown}
        style={{ width: 16, height: 16, position: 'absolute', right: 6, bottom: 6, cursor: 'nwse-resize', opacity: 0.8 }}
        aria-hidden
      />
    </div>
  );
}
