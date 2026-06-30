import fs from "node:fs";
import ts from "typescript";

const deployEnvironment = process.env.DEPLOY_ENVIRONMENT;
const sourceConfigPath = "wrangler.jsonc";
const generatedConfigPath = "dist/client/wrangler.json";
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
fs.writeFileSync(generatedConfigPath, `${JSON.stringify(generatedConfig, null, 2)}\n`);
