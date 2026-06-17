import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

const tupleSchema = z.tuple([z.number(), z.number(), z.number()]);

const keyframeSchema = z.object({
  id: z.string().min(1),
  progress: z.number().min(0).max(1),
  position: tupleSchema,
  lookAt: tupleSchema,
  mouse: z.object({ x: z.number(), y: z.number() }).optional(),
  damping: z.number().optional(),
});

const payloadSchema = z.object({
  cameraPath: z.array(keyframeSchema).min(2),
});

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString();
}

function formatTuple(value: [number, number, number]) {
  return `[${value.map(formatNumber).join(", ")}]`;
}

function serializeCameraPath(cameraPath: z.infer<typeof keyframeSchema>[]) {
  const sortedPath = [...cameraPath].sort((a, b) => a.progress - b.progress);
  const items = sortedPath
    .map((item) => {
      const lines = [
        "  {",
        `    id: ${JSON.stringify(item.id)},`,
        `    progress: ${formatNumber(item.progress)},`,
        `    position: ${formatTuple(item.position)},`,
        `    lookAt: ${formatTuple(item.lookAt)},`,
      ];

      if (item.mouse) {
        lines.push(`    mouse: { x: ${formatNumber(item.mouse.x)}, y: ${formatNumber(item.mouse.y)} },`);
      }

      if (typeof item.damping === "number") {
        lines.push(`    damping: ${formatNumber(item.damping)},`);
      }

      lines.push("  },");
      return lines.join("\n");
    })
    .join("\n");

  return `import type { CameraKeyframe } from "@/types";\n\nexport const cameraPath: CameraKeyframe[] = [\n${items}\n];\n`;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = payloadSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten() }, { status: 400 });
  }

  const source = serializeCameraPath(result.data.cameraPath);

  if (process.env.VERCEL) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      source,
      message: "Vercel не может менять файлы проекта после деплоя. Код камеры подготовлен для копирования.",
    });
  }

  const filePath = path.join(process.cwd(), "src/config/camera-path.ts");
  await writeFile(filePath, source, "utf8");

  return NextResponse.json({ ok: true, persisted: true, source });
}
