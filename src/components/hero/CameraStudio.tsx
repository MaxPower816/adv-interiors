"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Camera, Save, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CameraKeyframe, Vec3Tuple } from "@/types";

type CapturedCamera = {
  position: Vec3Tuple;
  lookAt: Vec3Tuple;
};

export type CameraStudioAction = {
  id: number;
  mode: "capture" | "save";
};

function round(value: number) {
  return Number(value.toFixed(3));
}

function toTuple(values: { x: number; y: number; z: number }): Vec3Tuple {
  return [round(values.x), round(values.y), round(values.z)];
}

function tupleToString(value: Vec3Tuple) {
  return `[${value.map((item) => item.toFixed(2)).join(", ")}]`;
}

export function CameraStudioControls({
  enabled,
  selected,
  action,
  onCapture,
}: {
  enabled: boolean;
  selected: CameraKeyframe;
  action: CameraStudioAction | null;
  onCapture: (camera: CapturedCamera, mode: CameraStudioAction["mode"]) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    document.body.classList.toggle("camera-studio-active", enabled);
    return () => {
      document.body.classList.remove("camera-studio-active");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !controlsRef.current) return;
    camera.position.set(selected.position[0], selected.position[1], selected.position[2]);
    controlsRef.current.target.set(selected.lookAt[0], selected.lookAt[1], selected.lookAt[2]);
    controlsRef.current.update();
  }, [camera, enabled, selected]);

  useEffect(() => {
    if (!enabled || !action || !controlsRef.current) return;
    const capturedLookAt = controlsRef.current.target.clone();

    if (capturedLookAt.distanceTo(camera.position) < 0.35) {
      const direction = new Vector3();
      camera.getWorldDirection(direction);
      capturedLookAt.copy(camera.position).add(direction.multiplyScalar(4));
    }

    onCapture({
      position: toTuple(camera.position),
      lookAt: toTuple(capturedLookAt),
    }, action.mode);
  }, [action, camera, enabled, onCapture]);

  if (!enabled) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableZoom
      rotateSpeed={0.55}
      panSpeed={0.6}
      zoomSpeed={0.65}
    />
  );
}

export function CameraStudioPanel({
  cameraPath,
  selectedIndex,
  enabled,
  onToggle,
  onSelect,
  onCaptureRequest,
  onSaveRequest,
  onUpdateKeyframe,
  status,
}: {
  cameraPath: CameraKeyframe[];
  selectedIndex: number;
  enabled: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
  onCaptureRequest: () => void;
  onSaveRequest: () => void;
  onUpdateKeyframe: (index: number, patch: Partial<CameraKeyframe>) => void;
  status: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = cameraPath[selectedIndex];

  return (
    <div className="pointer-events-auto absolute bottom-5 left-5 z-[60] max-w-[calc(100vw-40px)] text-[#e7e3e0]">
      {!open ? (
        <button
          className="glass inline-flex min-h-11 items-center gap-3 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
          onClick={() => setOpen(true)}
        >
          <Camera className="h-4 w-4" />
          Camera Studio
        </button>
      ) : (
        <div
          className="glass w-[min(420px,calc(100vw-40px))] p-4"
          onPointerDown={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#a69c96]">Camera Studio</p>
              <p className="mt-1 text-sm text-[#cbc9c8]">Двигай сцену мышкой и сохраняй этапы</p>
            </div>
            <button className="min-h-10 min-w-10 border border-[#e7e3e0]/20" aria-label="Закрыть Camera Studio" onClick={() => setOpen(false)}>
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm">
              Этап
              <select
                className="min-h-11 border border-[#e7e3e0]/15 bg-[#080706] px-3"
                value={selectedIndex}
                onChange={(event) => onSelect(Number(event.target.value))}
              >
                {cameraPath.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.id} — {item.progress}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                className={`min-h-11 border px-3 text-sm ${enabled ? "bg-[#e7e3e0] text-[#080706]" : "border-[#e7e3e0]/20"}`}
                onClick={onToggle}
              >
                {enabled ? "Редактирование ON" : "Редактирование OFF"}
              </button>
              <button className="min-h-11 border border-[#e7e3e0]/20 px-3 text-sm" onClick={onCaptureRequest}>
                Взять текущий вид
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-[#cbc9c8]">
              <div className="border border-[#e7e3e0]/12 p-3">
                <p className="uppercase tracking-[0.16em] text-[#a69c96]">position</p>
                <p className="mt-2 font-mono">{tupleToString(selected.position)}</p>
              </div>
              <div className="border border-[#e7e3e0]/12 p-3">
                <p className="uppercase tracking-[0.16em] text-[#a69c96]">lookAt</p>
                <p className="mt-2 font-mono">{tupleToString(selected.lookAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-[#cbc9c8]">
                progress
                <input
                  className="min-h-10 border border-[#e7e3e0]/15 bg-[#080706] px-3"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selected.progress}
                  onChange={(event) => onUpdateKeyframe(selectedIndex, { progress: Number(event.target.value) })}
                />
              </label>
              <label className="grid gap-1 text-xs text-[#cbc9c8]">
                плавность
                <input
                  className="min-h-10 border border-[#e7e3e0]/15 bg-[#080706] px-3"
                  type="number"
                  min={0.5}
                  max={8}
                  step={0.05}
                  value={selected.damping ?? 2.2}
                  onChange={(event) => onUpdateKeyframe(selectedIndex, { damping: Number(event.target.value) })}
                />
              </label>
            </div>

            <button className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#e7e3e0] px-4 text-sm font-semibold text-[#080706]" onClick={onSaveRequest}>
              <Save className="h-4 w-4" />
              Сохранить текущий вид
            </button>

            <div className="flex items-start gap-2 text-xs leading-5 text-[#a69c96]">
              <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Левая кнопка мыши вращает, колесо приближает, правая кнопка или Shift двигает сцену. На Vercel сохранение остается в этом браузере и копирует код камеры для GitHub.</p>
            </div>
            {status ? <p className="text-xs text-[#cbc9c8]">{status}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
