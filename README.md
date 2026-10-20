# mac-cleanup

A conservative interactive macOS cleanup CLI for developer-tool caches, generated data, emulators, and local models.

`mac-cleanup` finds supported cleanup candidates, calculates their estimated sizes, and lets you select exactly what to delete.

## Requirements

- macOS
- Node.js 18 or later
- Yarn 1.x (for development and building from a checkout)

Some cleanup candidates also require their native tool to be installed, such as Docker, Xcode Command Line Tools, npm, Yarn, pnpm, or Ollama.

## Local Setup

From a local checkout:

```bash
git clone https://github.com/Blackfaded/mac-cleanup.git mac-cleanup
cd mac-cleanup
yarn install
```

## Global Installation

From the checkout, build and install the command:

```bash
yarn build
npm install --global .
```

You can then run it from any directory:

```bash
mac-cleanup --help
mac-cleanup --nodejs-project-dir ~/Code --search-depth 4
```

The command requires Node.js at runtime. Ensure npm's global bin directory (`npm prefix --global` followed by `/bin` on macOS) is on your `PATH`. If you use a Node.js version manager, the global installation belongs to the active Node.js version.

After updating the checkout, run the build and global installation commands again. To uninstall:

```bash
npm uninstall --global mac-cleanup
```

To create a distributable package, run `npm pack`. Its `prepack` hook builds the CLI automatically. Install the resulting archive with `npm install --global ./mac-cleanup-0.1.0.tgz`; the package includes compiled JavaScript and installs only runtime dependencies.

## Usage

Run the interactive cleanup flow:

```bash
yarn dev
```

Node.js project discovery is opt-in. Supply directories to find outermost Node.js project roots. Each discovered project is one cleanup choice that includes its `node_modules`, Nx caches, and Turborepo caches, including those in nested workspaces and submodules.

| Option | Description |
| --- | --- |
| `--nodejs-project-dir <path>` | Directory to search for Node.js project roots. Repeat for multiple directories; comma-separated paths are not supported. |
| `--search-depth <number>` | Maximum directory depth to search for Node.js project roots. Applies only with `--nodejs-project-dir`; defaults to `5`. A direct child has depth `1`. |

```bash
yarn dev --nodejs-project-dir ~/Code --nodejs-project-dir ~/Clients --search-depth 4
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
| JavaScript | Individually selectable Node.js projects, each containing all `node_modules`, Nx caches, and Turborepo caches in its tree; npm cache, nvm download cache, Yarn cache, pnpm unreferenced store packages |
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
- Node.js project discovery is limited to directories explicitly provided through `--nodejs-project-dir`, which must be real directories below the current user's home directory.
- Symbolic links, unreadable directories, `.git`, and `node_modules` are not scanned while discovering project roots.
- Only matching cleanup artifacts are listed; source files are not cleanup targets.
- A failure for one selected target does not prevent the remaining selected targets from running.

## Development

```bash
# Run the CLI
yarn dev

# Compile the global CLI into dist/
yarn build

# Install development Git hooks
yarn hooks:install

# Check types
yarn typecheck

# Check formatting
yarn format:check

# Run lint rules
yarn lint

# Apply Biome formatting, lint, and safe fixes
yarn biome:fix
```

Run `yarn hooks:install` once after setting up a development checkout. Lefthook installs these Git hooks:

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
