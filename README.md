# mac-cleanup

A conservative interactive macOS cleanup CLI for developer-tool caches, generated data, emulators, and local models.

`mac-cleanup` finds supported cleanup candidates, calculates their estimated sizes, and lets you select exactly what to delete.

## Requirements

- macOS
- Node.js 18 or later
- Yarn 1.x

Some cleanup candidates also require their native tool to be installed, such as Docker, Xcode Command Line Tools, npm, Yarn, pnpm, or Ollama.

## Local Setup

From a local checkout:

```bash
git clone https://github.com/Blackfaded/mac-cleanup.git mac-cleanup
cd mac-cleanup
yarn install
```

## Usage

Run the interactive cleanup flow:

```bash
yarn dev
```

Project-module scanning is opt-in. Supply project directories to find `node_modules`, Nx caches, and Turborepo caches.

| Option | Description |
| --- | --- |
| `--project-dir <path>` | Project directory to scan. Repeat for multiple roots; comma-separated paths are not supported. |
| `--search-depth <number>` | Maximum directory depth to scan from each project directory. Applies only with `--project-dir`; defaults to `5`. A direct child has depth `1`. |

```bash
yarn dev --project-dir ~/Code --project-dir ~/Clients --search-depth 4
```

The CLI:

1. Discovers available cleanup candidates and calculates their sizes.
2. Lets you select individual candidates with checkboxes.
3. Shows the selected targets again.
4. Requires acknowledgement and typing `CLEAN` before it deletes only those targets.

Selecting nothing, declining acknowledgement, or entering anything other than `CLEAN` exits without deletion.

## Cleanup Targets

Candidates appear only when their required path exists and, where needed, their native command is available.

| Category | Targets |
| --- | --- |
| JavaScript | Individually selectable project `node_modules`, Nx caches, Turborepo caches, npm cache, nvm download cache, Yarn cache, pnpm unreferenced store packages |
| Build tools | Gradle caches, Xcode DerivedData |
| Apple simulators | Individually selectable iOS simulators and installed iOS runtimes |
| Android | Individually selectable Android virtual devices |
| Containers | Docker build cache, Docker dangling images |
| Local AI | Individually selectable Ollama models |
| Other tools | Pulumi provider plugins, Puppeteer browser cache, OpenCode cache |

## Safety

- Discovery and size calculation are read-only.
- There is no non-interactive deletion mode.
- Only selected targets can be deleted.
- Deletion requires both an acknowledgement and the exact confirmation text `CLEAN`.
- Native commands manage npm, Yarn, pnpm, Docker, Xcode simulators, and Ollama data.
- Direct directory deletion is limited to explicit paths beneath the current user's home directory.
- Direct deletion rejects symbolic links and non-directory paths.
- Project-module scanning is limited to directories explicitly provided through `--project-dir`, which must be real directories below the current user's home directory.
- Symbolic links and unreadable directories are not scanned.
- Only matching cleanup artifacts are listed; source files are not cleanup targets.
- A failure for one selected target does not prevent the remaining selected targets from running.

## Development

```bash
# Run the CLI
yarn dev

# Check types
yarn typecheck

# Check formatting
yarn format:check

# Run lint rules
yarn lint

# Apply Biome formatting, lint, and safe fixes
yarn biome:fix
```

Lefthook installs Git hooks during `yarn install`:

- `pre-commit` runs linting and formatting checks.
- `commit-msg` enforces Conventional Commit messages through Commitlint.

Examples:

```text
feat: add a cleanup target
fix: reject paths outside the home directory
chore: update dependencies
```

## License

MIT. See [LICENSE](LICENSE).
