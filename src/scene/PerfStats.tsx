import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

/** Ontwikkelhulp (?perf in de URL): draw calls, driehoeken en fps. */
export function PerfStats() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  const [stats, setStats] = useState({ calls: 0, triangles: 0, fps: 0 });

  useFrame(() => {
    frames.current++;
  });

  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      setStats({
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        fps: Math.round((frames.current * 1000) / (now - last)),
      });
      frames.current = 0;
      last = now;
    }, 1000);
    return () => window.clearInterval(id);
  }, [gl]);

  return (
    <Html fullscreen zIndexRange={[6, 6]} style={{ pointerEvents: 'none' }}>
      <pre data-perf className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-1 font-mono text-[11px] text-white">
        {`calls ${stats.calls}  tris ${stats.triangles}  fps ${stats.fps}`}
      </pre>
    </Html>
  );
}
