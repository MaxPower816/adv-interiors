"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MeshStandardMaterial } from "three";
import { stageProgress } from "@/lib/utils";

function useReveal(progress: number, start: number, end: number) {
  return stageProgress(progress, start, end);
}

function RevealGroup({ visible, children }: { visible: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = visible > 0.01;
    ref.current.scale.lerp({ x: 0.92 + visible * 0.08, y: 0.92 + visible * 0.08, z: 0.92 + visible * 0.08 } as Group["scale"], 0.08);
    ref.current.position.y += ((1 - visible) * -0.12 - ref.current.position.y) * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

export function ProceduralRoom({ progress }: { progress: number }) {
  const concrete = useMemo(() => new MeshStandardMaterial({ color: "#69635d", roughness: 0.9 }), []);
  const warmWall = useMemo(() => new MeshStandardMaterial({ color: "#7a7068", roughness: 0.75 }), []);
  const wood = useMemo(() => new MeshStandardMaterial({ color: "#6f5746", roughness: 0.65 }), []);
  const textile = useMemo(() => new MeshStandardMaterial({ color: "#8a7d74", roughness: 0.92 }), []);
  const dark = useMemo(() => new MeshStandardMaterial({ color: "#0d0c0b", roughness: 0.8 }), []);
  const brass = useMemo(() => new MeshStandardMaterial({ color: "#b08b61", roughness: 0.35, metalness: 0.5 }), []);

  const architecture = useReveal(progress, 0.12, 0.25);
  const lighting = useReveal(progress, 0.25, 0.4);
  const furniture = useReveal(progress, 0.4, 0.58);
  const details = useReveal(progress, 0.58, 0.72);

  return (
    <group>
      <group name="RoomShell">
        <mesh position={[0, -0.05, 0]} receiveShadow material={concrete} name="FloorRaw">
          <boxGeometry args={[5.8, 0.1, 4.8]} />
        </mesh>
        <mesh position={[0, 1.6, -2.4]} receiveShadow material={concrete} name="ConcreteWalls">
          <boxGeometry args={[5.8, 3.2, 0.12]} />
        </mesh>
        <mesh position={[-2.9, 1.6, 0]} receiveShadow material={concrete}>
          <boxGeometry args={[0.12, 3.2, 4.8]} />
        </mesh>
        <mesh position={[2.9, 1.6, 0]} receiveShadow material={concrete}>
          <boxGeometry args={[0.12, 3.2, 4.8]} />
        </mesh>
      </group>

      <RevealGroup visible={architecture}>
        <mesh position={[0, 0, 0]} receiveShadow material={wood} name="FloorFinished">
          <boxGeometry args={[5.7, 0.06, 4.7]} />
        </mesh>
        <mesh position={[0, 1.62, -2.33]} material={warmWall} name="FinishedWalls">
          <boxGeometry args={[5.5, 3.05, 0.08]} />
        </mesh>
        <mesh position={[0, 3.16, 0]} material={dark} name="Ceiling">
          <boxGeometry args={[5.8, 0.08, 4.8]} />
        </mesh>
        {[-1.8, -0.6, 0.6, 1.8].map((x) => (
          <mesh key={x} position={[x, 1.55, -2.27]} material={dark} name="Panels">
            <boxGeometry args={[0.035, 2.45, 0.08]} />
          </mesh>
        ))}
      </RevealGroup>

      <RevealGroup visible={lighting}>
        <mesh position={[1.8, 1.8, -2.24]} material={new MeshStandardMaterial({ color: "#e9d8c4", transparent: true, opacity: 0.28 })} name="Curtains">
          <boxGeometry args={[1.1, 2.3, 0.05]} />
        </mesh>
        <mesh position={[0, 3.02, -0.3]} material={brass} name="Lighting">
          <boxGeometry args={[3.6, 0.035, 0.06]} />
        </mesh>
        {[-1.3, 0, 1.3].map((x) => (
          <pointLight key={x} position={[x, 2.82, -0.35]} intensity={lighting * 0.75} color="#f1d1ac" />
        ))}
      </RevealGroup>

      <RevealGroup visible={furniture}>
        <RoundedBox args={[2.25, 0.48, 0.78]} radius={0.08} position={[-0.6, 0.38, -0.9]} material={textile} name="Sofa" castShadow />
        <RoundedBox args={[0.72, 0.42, 0.78]} radius={0.08} position={[1.25, 0.34, -0.55]} material={textile} name="Armchair" castShadow />
        <RoundedBox args={[1.2, 0.16, 0.62]} radius={0.05} position={[0.15, 0.24, 0.22]} material={dark} name="CoffeeTable" castShadow />
        <mesh position={[0.05, 0.04, -0.05]} material={new MeshStandardMaterial({ color: "#9a8a7f", roughness: 0.95 })} name="Rug">
          <boxGeometry args={[3.2, 0.03, 1.7]} />
        </mesh>
      </RevealGroup>

      <RevealGroup visible={details}>
        <group name="Plants" position={[-2.15, 0.4, -1.55]}>
          <mesh material={dark}><cylinderGeometry args={[0.18, 0.14, 0.36, 24]} /></mesh>
          <mesh position={[0, 0.55, 0]} material={new MeshStandardMaterial({ color: "#5f6a50", roughness: 0.9 })}><sphereGeometry args={[0.34, 24, 16]} /></mesh>
        </group>
        <group name="Decor" position={[0.35, 0.43, 0.22]}>
          <mesh material={brass}><cylinderGeometry args={[0.06, 0.08, 0.3, 20]} /></mesh>
          <mesh position={[0.25, 0.02, 0.08]} material={warmWall}><boxGeometry args={[0.28, 0.05, 0.18]} /></mesh>
        </group>
        <RoundedBox name="Textiles" args={[0.6, 0.08, 0.5]} radius={0.04} position={[-0.9, 0.68, -0.9]} material={new MeshStandardMaterial({ color: "#c1b6ad", roughness: 0.95 })} />
      </RevealGroup>
    </group>
  );
}
