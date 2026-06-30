import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_REALM = "shorten-me development";

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"`,
    },
  });
}

function forbidden(): NextResponse {
  return new NextResponse("Development basic auth is not configured", {
    status: 503,
  });
}

function decodeBasicCredentials(
  header: string | null
): { username: string; password: string } | null {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function credentialsMatch(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }

  return difference === 0;
}

export function proxy(request: NextRequest): NextResponse {
  if (env.DEPLOY_ENVIRONMENT !== "development") {
    return NextResponse.next();
  }

  if (!env.BASIC_AUTH_USERNAME || !env.BASIC_AUTH_PASSWORD) {
    return forbidden();
  }

  const credentials = decodeBasicCredentials(request.headers.get("authorization"));

  if (
    !credentials ||
    !credentialsMatch(credentials.username, env.BASIC_AUTH_USERNAME) ||
    !credentialsMatch(credentials.password, env.BASIC_AUTH_PASSWORD)
  ) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
