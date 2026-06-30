import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../_lib/password";
import { signJwt } from "../_lib/jwt";
import { createUserRecord, isMissingKvBindingError } from "../_lib/kv";
import { V3Env } from "../_lib/types";
import { env } from "cloudflare:workers";
import { AuthResponse } from "../_lib/types";

const runtimeEnv = env as unknown as V3Env;

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const passwordHash = await hashPassword(String(password));
    const user = await createUserRecord(runtimeEnv, {
      email: String(email),
      username: String(username),
      passwordHash
    });

    const token = await signJwt(
      {
        user_id: user.id,
        email: user.email,
        username: user.username
      },
      runtimeEnv
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (isMissingKvBindingError(error)) {
      return NextResponse.json(
        { error: "Local KV storage is not configured. Check the SHORTENME_KV binding." },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Email already exists" || message === "Username already exists" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
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
