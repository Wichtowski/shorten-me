import fs from "node:fs";

import dotenv from "dotenv";
import ts from "typescript";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", quiet: true, override: true });

const sourceConfigPath = "wrangler.jsonc";
const localConfigPath = "wrangler.local.jsonc";
const kvNamespacePlaceholder = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID";
const localEnvironment = "development";

const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const jwtSecret = process.env.JWT_SECRET;
const basicAuthUsername = process.env.BASIC_AUTH_USERNAME;
const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

if (!kvNamespaceId) {
  throw new Error("CLOUDFLARE_KV_NAMESPACE_ID is required for local remote KV");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required for local development");
}

if (!basicAuthUsername || !basicAuthPassword) {
  throw new Error("BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are required for local development");
}

const sourceConfigResult = ts.parseConfigFileTextToJson(
  sourceConfigPath,
  fs.readFileSync(sourceConfigPath, "utf8")
);

if (sourceConfigResult.error) {
  throw new Error(ts.flattenDiagnosticMessageText(sourceConfigResult.error.messageText, "\n"));
}

const sourceConfig = sourceConfigResult.config;
const environmentConfig = sourceConfig.env?.[localEnvironment];

if (!environmentConfig) {
  throw new Error(`Missing Cloudflare environment: ${localEnvironment}`);
}

const localConfig = {
  ...sourceConfig,
  ...environmentConfig,
  vars: {
    ...(environmentConfig.vars ?? {}),
    JWT_SECRET: jwtSecret,
    BASIC_AUTH_USERNAME: basicAuthUsername,
    BASIC_AUTH_PASSWORD: basicAuthPassword
  }
};

delete localConfig.env;
replaceKvNamespaceId(localConfig);
markKvNamespacesRemote(localConfig);

fs.writeFileSync(localConfigPath, `${JSON.stringify(localConfig, null, 2)}\n`);

function replaceKvNamespaceId(config) {
  for (const namespace of config.kv_namespaces ?? []) {
    if (namespace.id === kvNamespacePlaceholder) {
      namespace.id = kvNamespaceId;
    }
  }
}

function markKvNamespacesRemote(config) {
  for (const namespace of config.kv_namespaces ?? []) {
    namespace.remote = true;
  }
}
