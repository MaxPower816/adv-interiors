import { Environment } from "@react-three/drei";

export function SceneLighting({ progress }: { progress: number }) {
  return (
    <>
      <ambientLight intensity={0.45 + progress * 0.45} color="#d9c5b5" />
      <directionalLight position={[2, 5, 4]} intensity={1 + progress * 1.2} color="#f0d4b3" castShadow />
      <pointLight position={[-2, 2.2, 1]} intensity={progress * 1.4} color="#d9ad7f" />
      <Environment preset="apartment" />
      <fog attach="fog" args={["#080706", 6 - progress * 2, 14]} />
    </>
  );
}
