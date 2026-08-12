# mac-cleanup

A conservative, private macOS cleanup CLI for developer-tool caches and generated data.

## Safety

- `npm run dev` starts with a read-only size and effect preview, then offers target selection.
- Deletion requires interactive selection, acknowledgement, and typing `CLEAN`.
- It never scans or changes `Downloads`, `Documents`, source projects, credentials, or system files.
- Raw deletion is restricted to explicit cache paths under the current user's home directory and refuses symbolic links.
- Docker, package-manager, simulator, and Ollama cleanup use their native commands.

## Usage

```bash
npm install
npm run dev
npm run typecheck
```

Run directly without an npm script:

```bash
npx tsx src/index.ts
```

## Cleanup candidates

- npm, nvm, Yarn, pnpm, and Gradle caches
- Xcode DerivedData and unavailable iOS simulators
- Individually selectable Android virtual devices
- Docker build cache and dangling images
- Individually selectable Ollama models
- Pulumi provider plugins, Puppeteer browser cache, and OpenCode cache

Candidates appear only when their relevant paths and required native tools are available.
