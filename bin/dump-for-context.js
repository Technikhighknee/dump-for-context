#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { generateContextDump } from '../src/dump-context.js';

const CONFIG_FILENAME = 'dump.config.js';
const configPath = path.join(process.cwd(), CONFIG_FILENAME);

// --- Parse CLI args ---
const args = process.argv.slice(2);

function readFlag(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const configKey = readFlag('--config');
let rootArg = readFlag('--root');
let outputArg = readFlag('--output');
const ignoreDirsArg = readFlag('--ignore-dirs');
const ignorePatternsArg = readFlag('--ignore-patterns');
const languageMapArg = readFlag('--language-map');

const consumed = new Set([
  '--config', configKey,
  '--root', rootArg,
  '--output', outputArg,
  '--ignore-dirs', ignoreDirsArg,
  '--ignore-patterns', ignorePatternsArg,
  '--language-map', languageMapArg,
]);

for (const arg of args) {
  if (!arg.startsWith('--') && !consumed.has(arg) && !rootArg) {
    rootArg = arg;
  }
}

/**
 * Loads the configuration module and returns the selected export.
 * Falls back to default or empty object.
 */
async function loadConfig() {
  if (!fs.existsSync(configPath)) {
    console.warn(`[dump-for-context] No ${CONFIG_FILENAME} found. Using internal defaults.`);
    return {};
  }

  try {
    const module = await import(pathToFileURL(configPath));
    if (configKey) {
      const named = module[configKey];
      if (!named) {
        console.error(`[dump-for-context] No config named "${configKey}" found in ${CONFIG_FILENAME}.`);
        process.exit(1);
      }
      console.log(`[dump-for-context] Using config: ${configKey}`);
      return named;
    }

    console.log('[dump-for-context] Using default config');
    return module.default || {};

  } catch (err) {
    console.error(`[dump-for-context] Failed to load config: ${err.message}`);
    process.exit(1);
  }
}

const config = await loadConfig();

if (rootArg) {
  config.rootDir = path.resolve(rootArg);
}
if (outputArg) {
  config.outputFile = outputArg;
}
if (ignoreDirsArg) {
  config.ignoredDirs = ignoreDirsArg.split(',').map(s => s.trim());
}
if (ignorePatternsArg) {
  config.ignoredPatterns = ignorePatternsArg.split(',').map(s => s.trim());
}
if (languageMapArg) {
  try {
    config.languageMap = JSON.parse(languageMapArg);
  } catch (err) {
    console.error('[dump-for-context] Failed to parse --language-map JSON');
    process.exit(1);
  }
}

if (rootArg && !outputArg) {
  const absOut = path.join(process.cwd(), 'context-dump.md');
  config.outputFile = path.relative(config.rootDir, absOut);
}

generateContextDump(config);
