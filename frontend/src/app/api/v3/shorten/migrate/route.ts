import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { migrateShortensToUser, resolveAuthToken, normalizeShortenDraftInput } from "../../_lib/kv";
import { V3Env } from "../../_lib/types";

const runtimeEnv = env as unknown as V3Env;

export async function PUT(req: NextRequest) {
  try {
    const authToken = await resolveAuthToken(runtimeEnv, req.headers.get("authorization"));
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const shortens = Array.isArray(body.shortens)
      ? body.shortens.map(normalizeShortenDraftInput)
      : [];
    if (shortens.length === 0) {
      return NextResponse.json({ error: "No shortens to migrate" }, { status: 400 });
    }

    const migrated = await migrateShortensToUser(runtimeEnv, authToken.user_id, shortens);

    return NextResponse.json({
      migrated,
      urls: migrated
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
