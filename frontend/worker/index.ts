/**
 * Cloudflare Worker entry point for the Vinext App Router runtime.
 *
 * Keep this file in source control so Wrangler deploys the SSR Worker entry
 * instead of only uploading static assets.
 */
import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
  isImageOptimizationPath
} from "vinext/server/image-optimization";
import type { ImageConfig } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

const imageConfig: ImageConfig = {
  deviceSizes: JSON.parse(
    process.env.__VINEXT_IMAGE_DEVICE_SIZES ?? JSON.stringify(DEFAULT_DEVICE_SIZES)
  ),
  imageSizes: JSON.parse(process.env.__VINEXT_IMAGE_SIZES ?? JSON.stringify(DEFAULT_IMAGE_SIZES)),
  qualities: JSON.parse(process.env.__VINEXT_IMAGE_QUALITIES ?? "null") ?? undefined,
  dangerouslyAllowSVG: process.env.__VINEXT_IMAGE_DANGEROUSLY_ALLOW_SVG === "true"
};

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (isImageOptimizationPath(url.pathname)) {
      const allowedWidths = [
        ...(imageConfig.deviceSizes ?? DEFAULT_DEVICE_SIZES),
        ...(imageConfig.imageSizes ?? DEFAULT_IMAGE_SIZES)
      ];

      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });

            return result.response();
          }
        },
        allowedWidths,
        imageConfig
      );
    }

    return handler.fetch(request, env, ctx);
  }
};

export default worker;
