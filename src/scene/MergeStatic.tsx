import { useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Voegt alle vaste meshes binnen deze groep per materiaal samen tot één mesh:
 * tientallen blokjes worden een handvol draw calls. De originelen blijven
 * (onzichtbaar) bestaan, zodat de componenten gewoon leesbaar blijven.
 * Alleen voor onderdelen die na het mounten niet meer veranderen.
 */
export function MergeStatic({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const toLocal = new THREE.Matrix4().copy(root.matrixWorld).invert();

    const byMaterial = new Map<THREE.Material, { geometries: THREE.BufferGeometry[]; sources: THREE.Mesh[] }>();
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || Array.isArray(mesh.material)) return;
      const geometry = mesh.geometry.index ? mesh.geometry.clone() : mesh.geometry.clone().setIndex(null);
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toLocal, mesh.matrixWorld));
      const entry = byMaterial.get(mesh.material) ?? { geometries: [], sources: [] };
      entry.geometries.push(geometry);
      entry.sources.push(mesh);
      byMaterial.set(mesh.material, entry);
    });

    const merged: THREE.Mesh[] = [];
    byMaterial.forEach(({ geometries, sources }, material) => {
      if (sources.length < 2) return;
      const geometry = mergeGeometries(geometries);
      geometries.forEach((g) => g.dispose());
      if (!geometry) return;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = sources[0].renderOrder;
      root.add(mesh);
      merged.push(mesh);
      sources.forEach((source) => (source.visible = false));
    });

    return () => {
      merged.forEach((mesh) => {
        root.remove(mesh);
        mesh.geometry.dispose();
      });
      root.traverse((object) => (object.visible = true));
    };
  }, []);

  return <group ref={group}>{children}</group>;
}
