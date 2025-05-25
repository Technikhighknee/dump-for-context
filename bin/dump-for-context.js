#!/usr/bin/env node
import { generateContextDump } from '../src/dump-context.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Parse args
const args = process.argv.slice(2);
const configKey = args.includes('--config') ? args[args.indexOf('--config') + 1] : null;

// Resolve config file
const CONFIG_FILE = path.join(process.cwd(), 'dump.config.js');
let configModule = {};
let config = {};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    configModule = await import(pathToFileURL(CONFIG_FILE));
    if (configKey) {
      config = configModule[configKey];
      if (!config) {
        console.error(`[dump-for-context] Config "${configKey}" not found in dump.config.js`);
        process.exit(1);
      }
      console.log(`[dump-for-context] Using config: ${configKey}`);
    } else {
      config = configModule.default || {};
      console.log(`[dump-for-context] Using default config`);
    }
  } catch (e) {
    console.error('[dump-for-context] Failed to load config:', e.message);
    process.exit(1);
  }
} else {
  console.warn('[dump-for-context] No dump.config.js found, using built-in defaults');
}

generateContextDump(config);