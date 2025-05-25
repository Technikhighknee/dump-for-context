#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { generateContextDump } from '../src/dump-context.js';

const CONFIG_FILENAME = 'dump.config.js';
const configPath = path.join(process.cwd(), CONFIG_FILENAME);

// --- Parse CLI args ---
const args = process.argv.slice(2);
const configFlagIndex = args.indexOf('--config');
const configKey = configFlagIndex !== -1 ? args[configFlagIndex + 1] : null;

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
generateContextDump(config);
