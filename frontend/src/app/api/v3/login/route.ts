import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "../_lib/password";
import { signJwt } from "../_lib/jwt";
import { getUserByEmail, isMissingKvBindingError } from "../_lib/kv";
import { V3Env } from "../_lib/types";
import { env } from "cloudflare:workers";
import { AuthResponse } from "../_lib/types";

const runtimeEnv = env as unknown as V3Env;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await getUserByEmail(runtimeEnv, String(email).trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const valid = await verifyPassword(String(password), user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    if (isMissingKvBindingError(error)) {
      return NextResponse.json(
        { error: "Local KV storage is not configured. Check the SHORTENME_KV binding." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
