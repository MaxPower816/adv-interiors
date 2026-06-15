"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { cameraPath } from "@/config/camera-path";
import type { CameraKeyframe, Vec3Tuple } from "@/types";

const cameraPosition = new Vector3();
const lookAtPosition = new Vector3();
const fromPosition = new Vector3();
const toPosition = new Vector3();
const fromLookAt = new Vector3();
const toLookAt = new Vector3();
const desiredLookAt = new Vector3();
const renderedLookAt = new Vector3();

function smoothstep(value: number) {
  const x = MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function setVector(vector: Vector3, value: Vec3Tuple) {
  vector.set(value[0], value[1], value[2]);
  return vector;
}

function getCameraSegment(progress: number, path: CameraKeyframe[]): {
  from: CameraKeyframe;
  to: CameraKeyframe;
  localProgress: number;
} {
  const sortedPath = [...path].sort((a, b) => a.progress - b.progress);
  const first = sortedPath[0];
  const last = sortedPath[sortedPath.length - 1];

  if (progress <= first.progress) {
    return { from: first, to: first, localProgress: 0 };
  }

  for (let index = 0; index < sortedPath.length - 1; index += 1) {
    const from = sortedPath[index];
    const to = sortedPath[index + 1];

    if (progress >= from.progress && progress <= to.progress) {
      return {
        from,
        to,
        localProgress: smoothstep((progress - from.progress) / (to.progress - from.progress)),
      };
    }
  }

  return { from: last, to: last, localProgress: 1 };
}

export function CameraRig({
  progress,
  disabled = false,
  path = cameraPath,
}: {
  progress: number;
  disabled?: boolean;
  path?: CameraKeyframe[];
}) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    if (disabled) return;
    const { from, to, localProgress } = getCameraSegment(progress, path);
    const desktop = typeof window !== "undefined" && !matchMedia("(pointer: coarse)").matches;
    const mouseX = desktop ? pointer.x * MathUtils.lerp(from.mouse?.x ?? 0, to.mouse?.x ?? 0, localProgress) : 0;
    const mouseY = desktop ? pointer.y * MathUtils.lerp(from.mouse?.y ?? 0, to.mouse?.y ?? 0, localProgress) : 0;
    const damping = MathUtils.lerp(from.damping ?? 2.2, to.damping ?? 2.2, localProgress);

    cameraPosition
      .copy(setVector(fromPosition, from.position))
      .lerp(setVector(toPosition, to.position), localProgress);
    lookAtPosition
      .copy(setVector(fromLookAt, from.lookAt))
      .lerp(setVector(toLookAt, to.lookAt), localProgress);

    cameraPosition.x += mouseX;
    cameraPosition.y += mouseY;

    const cameraEase = 1 - Math.exp(-delta * damping);
    const lookAtEase = 1 - Math.exp(-delta * (damping * 1.45));

    camera.position.lerp(cameraPosition, cameraEase);
    desiredLookAt.copy(lookAtPosition);
    renderedLookAt.lerp(desiredLookAt, lookAtEase);
    camera.lookAt(renderedLookAt);
  });

  return null;
}
