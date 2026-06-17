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

const cameraPathStorageKey = "adv-camera-path";

type SaveCameraPathResponse = {
  ok: boolean;
  persisted?: boolean;
  source?: string;
  message?: string;
};

function loadStoredCameraPath() {
  if (typeof window === "undefined") return initialCameraPath;

  try {
    const savedPath = window.localStorage.getItem(cameraPathStorageKey);
    if (!savedPath) return initialCameraPath;
    const parsedPath = JSON.parse(savedPath) as CameraKeyframe[];

    if (Array.isArray(parsedPath) && parsedPath.length >= 2) {
      return parsedPath;
    }
  } catch {
    window.localStorage.removeItem(cameraPathStorageKey);
  }

  return initialCameraPath;
}

export function RoomCanvas({ progress }: { progress: number }) {
  const [hasModel, setHasModel] = useState(false);
  const [cameraPath, setCameraPath] = useState<CameraKeyframe[]>(loadStoredCameraPath);
  const [studioEnabled, setStudioEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [studioAction, setStudioAction] = useState<CameraStudioAction | null>(null);
  const [studioStatus, setStudioStatus] = useState(() => (
    typeof window !== "undefined" && window.localStorage.getItem(cameraPathStorageKey)
      ? "Загружена камера, сохраненная в этом браузере."
      : ""
  ));

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

      const data = await response.json() as SaveCameraPathResponse;
      window.localStorage.setItem(cameraPathStorageKey, JSON.stringify(pathToSave));

      if (data.source) {
        await navigator.clipboard?.writeText(data.source).catch(() => undefined);
      }

      if (data.persisted) {
        setStudioStatus("Сохранено в файл. Выключи редактирование, чтобы проверить прокрутку.");
      } else {
        setStudioStatus("Сохранено в этом браузере. Код camera-path.ts скопирован: вставь его в файл и отправь в GitHub.");
      }
    } catch {
      window.localStorage.setItem(cameraPathStorageKey, JSON.stringify(pathToSave));
      setStudioStatus("Сохранено только в этом браузере. Постоянно на сайте появится после обновления файла в GitHub.");
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
