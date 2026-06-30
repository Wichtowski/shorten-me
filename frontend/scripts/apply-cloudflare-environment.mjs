import fs from "node:fs";
import ts from "typescript";

import dotenv from "dotenv";
dotenv.config({ path: ".env", quiet: true });

const deployEnvironment = process.env.DEPLOY_ENVIRONMENT;
const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const jwtSecret = process.env.JWT_SECRET;
const sourceConfigPath = "wrangler.jsonc";
const generatedConfigPath = "dist/server/wrangler.json";
const kvNamespacePlaceholder = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID";
const deployFields = [
  "name",
  "workers_dev",
  "preview_urls",
  "routes",
  "route",
  "kv_namespaces",
  "images",
  "vars",
  "observability"
];

if (!deployEnvironment) {
  throw new Error("DEPLOY_ENVIRONMENT is required");
}

const normalizedEnv = deployEnvironment.toLowerCase().trim();
const isProduction = normalizedEnv === "production";

if (!isProduction) {
  const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
  const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

  if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
    throw new Error("BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are required for non-production environments");
  }
}

if (!kvNamespaceId) {
  throw new Error("CLOUDFLARE_KV_NAMESPACE_ID is required");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const sourceConfigResult = ts.parseConfigFileTextToJson(
  sourceConfigPath,
  fs.readFileSync(sourceConfigPath, "utf8")
);

if (sourceConfigResult.error) {
  throw new Error(ts.flattenDiagnosticMessageText(sourceConfigResult.error.messageText, "\n"));
}

const sourceConfig = sourceConfigResult.config;
const environmentConfig = sourceConfig.env?.[normalizedEnv];

if (!environmentConfig) {
  throw new Error(`Missing Cloudflare environment: ${normalizedEnv}`);
}

const generatedConfig = JSON.parse(fs.readFileSync(generatedConfigPath, "utf8"));

for (const field of deployFields) {
  if (Object.prototype.hasOwnProperty.call(environmentConfig, field)) {
    generatedConfig[field] = environmentConfig[field];
  } else {
    delete generatedConfig[field];
  }
}

generatedConfig.vars = {
  ...(generatedConfig.vars ?? {}),
  ...(isProduction ? {} : {
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD
  }),
  JWT_SECRET: jwtSecret,
};

generatedConfig.definedEnvironments = Object.keys(sourceConfig.env ?? {});
replaceKvNamespaceId(generatedConfig);
fs.writeFileSync(generatedConfigPath, `${JSON.stringify(generatedConfig, null, 2)}\n`);

function replaceKvNamespaceId(config) {
  for (const namespace of config.kv_namespaces ?? []) {
    if (namespace.id === kvNamespacePlaceholder) {
      namespace.id = kvNamespaceId;
    }
  }
}
