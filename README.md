# dump-for-context

> ✨ A CLI tool to generate structured, Markdown-based context snapshots of your codebase — for language models, AI agents, and structured documentation workflows.

---

## 🧐 What is this?

When working with large language models (LLMs) like GPT, **context is everything**.
But feeding your entire codebase into a model is messy, error-prone, or just impossible.

**`dump-for-context`** solves that:

* 📂 It walks your directory tree
* 🧹 Ignores irrelevant folders like `.git`, `node_modules`, etc.
* 🚫 Skips any existing `context-dump.md` files
* 🗞 Wraps every file in syntax-highlighted, readable Markdown blocks
* 🧠 Produces a single `context-dump.md` file — ideal as input for LLMs, summarizers, or codex-style agents

Use it to:

* Feed your repo into a GPT agent
* Build prompts that reference your own system
* Generate structured documentation context
* Version your system state as Markdown

---

## 🥪 Example output

````md
// File: src/index.js
```js
console.log("Hello, world!");
```

// File: README.md
```md
# My Project
This is an overview of my system.
```

````

---

## 🛠 How to Use

### Option 1: Use with `npx`

```bash
npx dump-for-context
````

This will:

* Look for `dump.config.js` in your current directory (if available)
* Use the `default` export for configuration
* Output a file (default: `context-dump.md`) in your root folder

---

### Option 2: Install locally

```bash
npm install -D dump-for-context
```

Then add a script:

```json
"scripts": {
  "dump": "dump-for-context",
  "dump:gpt": "dump-for-context --config gpt"
}
```

And run:

```bash
npm run dump
npm run dump:gpt
```

---

## ⚙️ Configuration: `dump.config.js`

You can define **multiple named configurations** in a single file:

```js
// dump.config.js
export default {
  outputFile: 'context-dump.md',
  ignoredDirs: ['.git', 'node_modules'],
  ignoredPatterns: ['**/dev/**'],
};

export const gpt = {
  outputFile: 'context-dump.gpt.md',
  ignoredDirs: ['.git', 'node_modules', 'dist'],
  ignoredPatterns: ['**/*.log', '*.tmp'],
  languageMap: {
    js: 'javascript',
    md: 'markdown',
    yml: 'yaml',
    txt: 'text',
  } 
};
```

`ignoredPatterns` uses glob-style wildcards against relative paths. If either
`ignoredDirs` **or** `ignoredPatterns` match a path, that file or directory is
skipped.

### CLI options

```bash
# basic usage
dump-for-context [path]               # dump from `path`, output in CWD

# with flags
dump-for-context --config gpt        # uses named export `gpt`
dump-for-context --root src          # set root directory
dump-for-context --output custom.md  # custom output file
dump-for-context --ignore-dirs build,dist
dump-for-context --ignore-patterns "**/*.log"
dump-for-context --language-map '{"js":"javascript"}'
dump-for-context --max-lines 500       # split output into multiple files
```

If no config is found:
Defaults are used, including `outputFile: 'context-dump.md'`.

---

## 📦 Output Format

Each file in your project becomes a section like this:

````md
// File: path/to/file.js
```js
// your code here
```
````

File extension → code block language is auto-detected using `languageMap`.

---

## 📌 Default values

If no config is given, this fallback is used internally:

```js
{
  outputFile: 'context-dump.md',
  ignoredDirs: ['.git', 'node_modules'],
  ignoredPatterns: [],
  languageMap: {
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
  maxLines: Infinity,
}
````
`context-dump.md` files are skipped automatically, even if not listed in `ignoredPatterns`.

---

## 🥪 Test it locally

To preview behavior without publishing:

```bash
npm install -g .
dump-for-context
```

---

## 📄 License

This project is released under [The Unlicense](./UNLICENSE).
It is dedicated to the public domain — you may use, modify, publish, or distribute it for any purpose.

---

## 🧭 Why this matters

Language models don’t “understand” a repo like a human.
They read **structured context**.

This tool helps you give your AI collaborators the best possible view of your system — clearly, cleanly, and traceably.

> Built by [Jason Posch](https://github.com/technikhighknee)
> Inspired by systems that think with you, not for you.
