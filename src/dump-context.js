/**
 * @file
 * Generates a context snapshot of the codebase as Markdown — optimized for LLM input.
 * Each file is rendered as a Markdown code block, prefixed with a comment-style header.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Generates a Markdown-based context dump of a project directory.
 *
 * @param {Object} config - Configuration for the dump process.
 * @param {string} [config.rootDir=process.cwd()] - The base directory to start scanning from.
 * @param {string} [config.outputFile='context-dump.md'] - Output file name, relative to rootDir.
 * @param {string[]} [config.ignoredDirs=['.git', 'node_modules']] - Directory names to skip.
 * @param {Object<string, string>} [config.languageMap] - Maps file extensions to Markdown language tags.
 */
export function generateContextDump(config = {}) {
  const {
    rootDir = process.cwd(),
    outputFile = 'context-dump.md',
    ignoredDirs = ['.git', 'node_modules'],
    languageMap = {
      js: 'js',
      ts: 'ts',
      json: 'json',
      md: 'md',
      sh: 'bash',
      yml: 'yaml',
      yaml: 'yaml',
      txt: 'txt',
      lic: 'txt',
    },
  } = config;

  const IGNORED = new Set(ignoredDirs);

  /**
   * Recursively collects all non-ignored files in the directory.
   * @param {string} dir - Directory to scan.
   * @param {string[]} collected - Accumulator for results.
   * @returns {string[]} - List of file paths.
   */
  const collectFiles = (dir, collected = []) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED.has(entry.name)) {
          collectFiles(full, collected);
        }
      } else if (entry.isFile()) {
        const rel = path.relative(rootDir, full);
        if (rel === outputFile) continue; // Don't include the dump itself
        collected.push(full);
      }
    }

    return collected;
  };

  /**
   * Formats a file's content into a Markdown code block.
   * @param {string} filePath - Absolute path to file.
   * @returns {string} - Markdown-formatted string.
   */
  const formatFileContent = (filePath) => {
    const relPath = path.relative(rootDir, filePath).split(path.sep).join('/');
    const ext = path.extname(filePath).slice(1);
    const lang = languageMap[ext] || '';

    const header = `// File: ${relPath}`;
    const fence = '```' + lang;

    let body = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    if (body.endsWith('\n')) body = body.slice(0, -1);

    return [header, fence, body, '```', ''].join('\n');
  };

  const files = collectFiles(rootDir);
  const content = files.sort().map(formatFileContent).join('\n');
  fs.writeFileSync(path.join(rootDir, outputFile), content);
}

//
// CLI entrypoint
//
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generateContextDump();
}
