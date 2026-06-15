"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Material, Mesh, Object3D, Vector3 } from "three";
import { roomStages } from "@/config/room-stages";
import { stageProgress } from "@/lib/utils";

const ALWAYS_VISIBLE = new Set(["Scene", "RoomShell", "ConcreteWalls", "FloorRaw"]);
const STAGED_OBJECTS = new Set(roomStages.flatMap((stage) => stage.objects));

function isMesh(object: Object3D): object is Mesh {
  return object instanceof Mesh;
}

function cloneMaterial(material: Material | Material[]) {
  return Array.isArray(material) ? material.map((item) => item.clone()) : material.clone();
}

function applyOpacity(material: Material | Material[], opacity: number) {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((item) => {
    item.transparent = opacity < 0.995;
    item.opacity = opacity;
    item.depthWrite = opacity > 0.55;
    item.needsUpdate = true;
  });
}

function objectReveal(name: string, progress: number) {
  if (!name || ALWAYS_VISIBLE.has(name)) return 1;
  const stage = roomStages.find((item) => item.objects.includes(name));
  if (!stage) return 1;
  return stageProgress(progress, stage.start, stage.end);
}

function effectiveReveal(object: Object3D, root: Object3D, progress: number) {
  let current: Object3D | null = object;
  let reveal = 1;

  while (current && current !== root) {
    if (current.name && (ALWAYS_VISIBLE.has(current.name) || STAGED_OBJECTS.has(current.name))) {
      reveal = Math.min(reveal, objectReveal(current.name, progress));
    }
    current = current.parent;
  }

  return reveal;
}

export function GLBRoom({ progress, url = "/models/room.glb" }: { progress: number; url?: string }) {
  const rootRef = useRef<Group>(null);
  const { scene } = useGLTF(url);

  const { clonedScene, initialScales } = useMemo(() => {
    const scales = new Map<string, Vector3>();
    const clone = scene.clone(true);
    clone.traverse((object) => {
      scales.set(object.uuid, object.scale.clone());
      object.frustumCulled = false;
      if (isMesh(object)) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = cloneMaterial(object.material);
      }
    });
    return { clonedScene: clone, initialScales: scales };
  }, [scene]);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;

    root.traverse((object) => {
      const reveal = effectiveReveal(object, root, progress);
      object.visible = reveal > 0.015;

      if (object.name && STAGED_OBJECTS.has(object.name)) {
        const initialScale = initialScales.get(object.uuid);
        const scale = 0.94 + reveal * 0.06;
        if (initialScale) {
          object.scale.copy(initialScale).multiplyScalar(scale);
        }
      }

      if (isMesh(object)) {
        applyOpacity(object.material, reveal);
      }
    });
  });

  return (
    <group ref={rootRef} name="ImportedRoom" position={[0, -0.05, 0]} scale={1}>
      <primitive object={clonedScene} />
    </group>
  );
}
