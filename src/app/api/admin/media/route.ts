import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteMediaItem, getMediaLibrary, uploadMediaFile } from "@/lib/media";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, media: await getMediaLibrary() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "");
  const alt = String(formData.get("alt") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "File is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Only images are allowed" }, { status: 400 });
  }

  const media = await uploadMediaFile(file, { title, alt });
  return NextResponse.json({ ok: true, media });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await request.json() as { id?: string };

  if (!id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await deleteMediaItem(id);
  return NextResponse.json({ ok: true });
}
