import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { neighborHouses } from '../layout';
import { geometries, materials } from '../materials';

const bodySize = new THREE.Vector3(3.2, 2.4, 3);
const roofSize = new THREE.Vector3(3.5, 1.4, 3.8);

/** Buurhuizen rond de wijkkast, als twee instanced meshes (romp + dak) voor weinig draw calls. */
export function Neighborhood() {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  // Driehoekig prisma voor het zadeldak.
  const roofGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3);
    // As langs x (nok), punt naar boven, onderkant op y = 0.
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0.25, 0);
    return g;
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    neighborHouses.forEach(([x, z, rotation, s], i) => {
      q.setFromAxisAngle(up, rotation);
      m.compose(new THREE.Vector3(x, (bodySize.y * s) / 2, z), q, bodySize.clone().multiplyScalar(s));
      bodies.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, bodySize.y * s, z), q, roofSize.clone().multiplyScalar(s));
      roofs.current!.setMatrixAt(i, m);
    });
    bodies.current!.instanceMatrix.needsUpdate = true;
    roofs.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={bodies} args={[geometries.box, materials.building, neighborHouses.length]} />
      <instancedMesh ref={roofs} args={[roofGeometry, materials.roof, neighborHouses.length]} />
    </>
  );
}
