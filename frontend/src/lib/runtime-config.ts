import type { V3Env } from "@app/api/v3/_lib/types";

export function assertJwtConfigured(env: Pick<V3Env, "JWT_SECRET">): void {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
}
