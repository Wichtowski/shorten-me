import fs from "node:fs";
import ts from "typescript";

const deployEnvironment = process.env.DEPLOY_ENVIRONMENT;
const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const sourceConfigPath = "wrangler.jsonc";
const generatedConfigPath = "dist/client/wrangler.json";
const kvNamespacePlaceholder = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID";
const deployFields = [
  "name",
  "workers_dev",
  "preview_urls",
  "routes",
  "route",
  "kv_namespaces",
  "vars",
];

if (!deployEnvironment) {
  throw new Error("DEPLOY_ENVIRONMENT is required");
}

if (!kvNamespaceId) {
  throw new Error("CLOUDFLARE_KV_NAMESPACE_ID is required");
}

const sourceConfigResult = ts.parseConfigFileTextToJson(
  sourceConfigPath,
  fs.readFileSync(sourceConfigPath, "utf8")
);

if (sourceConfigResult.error) {
  throw new Error(ts.flattenDiagnosticMessageText(sourceConfigResult.error.messageText, "\n"));
}

const sourceConfig = sourceConfigResult.config;
const environmentConfig = sourceConfig.env?.[deployEnvironment];

if (!environmentConfig) {
  throw new Error(`Missing Cloudflare environment: ${deployEnvironment}`);
}

const generatedConfig = JSON.parse(fs.readFileSync(generatedConfigPath, "utf8"));

for (const field of deployFields) {
  if (Object.prototype.hasOwnProperty.call(environmentConfig, field)) {
    generatedConfig[field] = environmentConfig[field];
  } else {
    delete generatedConfig[field];
  }
}

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
