"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useState } from "react";
import { cameraPath as initialCameraPath } from "@/config/camera-path";
import type { CameraKeyframe } from "@/types";
import { CameraRig } from "./CameraRig";
import { CameraStudioControls, CameraStudioPanel, type CameraStudioAction } from "./CameraStudio";
import { GLBRoom } from "./GLBRoom";
import { ProceduralRoom } from "./ProceduralRoom";
import { SceneLighting } from "./SceneLighting";

export function RoomCanvas({ progress }: { progress: number }) {
  const [hasModel, setHasModel] = useState(false);
  const [cameraPath, setCameraPath] = useState<CameraKeyframe[]>(initialCameraPath);
  const [studioEnabled, setStudioEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [studioAction, setStudioAction] = useState<CameraStudioAction | null>(null);
  const [studioStatus, setStudioStatus] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/models/room.glb", { method: "HEAD" })
      .then((response) => {
        if (active) setHasModel(response.ok);
      })
      .catch(() => {
        if (active) setHasModel(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateKeyframe = useCallback((index: number, patch: Partial<CameraKeyframe>) => {
    setCameraPath((path) => path.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }, []);

  const saveCameraPath = useCallback(async (pathToSave: CameraKeyframe[]) => {
    setStudioStatus("Сохраняю текущий вид...");

    try {
      const response = await fetch("/api/camera-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameraPath: pathToSave }),
      });

      if (!response.ok) {
        const message = await response.text();
        setStudioStatus(`Не удалось сохранить: ${response.status}. ${message.slice(0, 90)}`);
        return;
      }

      setStudioStatus("Сохранено. Выключи редактирование, чтобы проверить прокрутку.");
    } catch {
      setStudioStatus("Не удалось сохранить. Проверь, что локальный сервер запущен.");
    }
  }, []);

  const applyCapturedCamera = useCallback(
    (camera: Pick<CameraKeyframe, "position" | "lookAt">, mode: CameraStudioAction["mode"]) => {
      setCameraPath((path) => {
        const nextPath = path.map((item, itemIndex) => (itemIndex === selectedIndex ? { ...item, ...camera } : item));

        if (mode === "save") {
          void saveCameraPath(nextPath);
        } else {
          setStudioStatus("Текущий вид взят. Теперь можно сохранить его в файл.");
        }

        return nextPath;
      });
    },
    [saveCameraPath, selectedIndex],
  );

  const requestStudioAction = useCallback((mode: CameraStudioAction["mode"]) => {
    setStudioEnabled(true);
    setStudioAction({ id: Date.now(), mode });
  }, []);

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [-2.4, 1.55, 5.5], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute inset-0"
      >
        <color attach="background" args={["#080706"]} />
        <Suspense fallback={null}>
          <SceneLighting progress={progress} />
          {hasModel ? <GLBRoom progress={progress} /> : <ProceduralRoom progress={progress} />}
          <CameraRig progress={progress} disabled={studioEnabled} path={cameraPath} />
          <CameraStudioControls
            enabled={studioEnabled}
            selected={cameraPath[selectedIndex]}
            action={studioAction}
            onCapture={applyCapturedCamera}
          />
        </Suspense>
      </Canvas>
      <CameraStudioPanel
        cameraPath={cameraPath}
        selectedIndex={selectedIndex}
        enabled={studioEnabled}
        onToggle={() => setStudioEnabled((value) => !value)}
        onSelect={setSelectedIndex}
        onCaptureRequest={() => requestStudioAction("capture")}
        onSaveRequest={() => requestStudioAction("save")}
        onUpdateKeyframe={updateKeyframe}
        status={studioStatus}
      />
    </>
  );
}
