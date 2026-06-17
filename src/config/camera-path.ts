import type { CameraKeyframe } from "@/types";

export const cameraPath: CameraKeyframe[] = [
  {
    id: "empty-room",
    progress: 0,
    position: [-8.465, 2.707, -0.097],
    lookAt: [4.994, 0.526, -0.268],
    mouse: { x: 0.12, y: 0.08 },
    damping: 10,
  },
  {
    id: "architecture",
    progress: 0.18,
    position: [-0.698, 3.99, -3.912],
    lookAt: [5.134, 1.517, 0.07],
    mouse: { x: 0.1, y: 0.07 },
    damping: 2.1,
  },
  {
    id: "lighting",
    progress: 0.36,
    position: [0.557, 3.933, 2.491],
    lookAt: [-4.71, 1.594, -1.709],
    mouse: { x: 0.09, y: 0.06 },
    damping: 2,
  },
  {
    id: "furniture",
    progress: 0.56,
    position: [-4.308, 2.391, -0.537],
    lookAt: [0.459, 1.685, -0.763],
    mouse: { x: 0.08, y: 0.05 },
    damping: 2,
  },
  {
    id: "details",
    progress: 0.71,
    position: [4.92, 3.04, 0.34],
    lookAt: [0.23, 2.08, -0.88],
    mouse: { x: 0.06, y: 0.04 },
    damping: 2.2,
  },
  {
    id: "reverse-reveal",
    progress: 1,
    position: [0.25, 3.85, 1.05],
    lookAt: [-5.5, 1.15, -2.8],
    mouse: { x: 0.04, y: 0.03 },
    damping: 2.35,
  },
];
