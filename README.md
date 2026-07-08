<div align="center">

# CLI Launcher

Cross-platform desktop launcher for AI coding CLIs. Install, update, uninstall, and launch 17 terminal AI agents — all from one mac-style panel.

<!-- Badges -->
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/github/stars/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=dark"><img alt="GitHub Stars" src="https://www.shieldcn.dev/github/stars/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/github/forks/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=dark"><img alt="GitHub Forks" src="https://www.shieldcn.dev/github/forks/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/github/release/MadBlast0/Cli-launcher.svg?size=sm&amp;mode=dark"><img alt="Release" src="https://www.shieldcn.dev/github/release/MadBlast0/Cli-launcher.svg?size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/github/ci/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=dark"><img alt="CI" src="https://www.shieldcn.dev/github/ci/MadBlast0/Cli-launcher.svg?variant=secondary&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/github/license/MadBlast0/Cli-launcher.svg?variant=ghost&amp;size=sm&amp;mode=dark"><img alt="License" src="https://www.shieldcn.dev/github/license/MadBlast0/Cli-launcher.svg?variant=ghost&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/badge/Language-TypeScript-3178C6.svg?logo=typescript&amp;variant=branded&amp;size=sm&amp;mode=dark"><img alt="TypeScript" src="https://www.shieldcn.dev/badge/Language-TypeScript-3178C6.svg?logo=typescript&amp;variant=branded&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/badge/Stack-React-61DAFB.svg?logo=react&amp;variant=branded&amp;size=sm&amp;mode=dark"><img alt="React" src="https://www.shieldcn.dev/badge/Stack-React-61DAFB.svg?logo=react&amp;variant=branded&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/badge/Bundler-Vite-646CFF.svg?logo=vite&amp;variant=branded&amp;size=sm&amp;mode=dark"><img alt="Vite" src="https://www.shieldcn.dev/badge/Bundler-Vite-646CFF.svg?logo=vite&amp;variant=branded&amp;size=sm&amp;mode=light"></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://www.shieldcn.dev/badge/Stack-Tailwind_CSS-06B6D4.svg?logo=tailwindcss&amp;variant=branded&amp;size=sm&amp;mode=dark"><img alt="Tailwind CSS" src="https://www.shieldcn.dev/badge/Stack-Tailwind_CSS-06B6D4.svg?logo=tailwindcss&amp;variant=branded&amp;size=sm&amp;mode=light"></picture>

<!-- Downloads -->
<p>
  <a href="https://github.com/MadBlast0/Cli-launcher/releases/latest"><img alt="Download for Windows" src="https://www.shieldcn.dev/badge/Download-Windows-0078D6.svg?logo=windows&variant=branded&size=md"></a>&nbsp;
  <a href="https://github.com/MadBlast0/Cli-launcher/releases/latest"><img alt="Download for macOS" src="https://www.shieldcn.dev/badge/Download-macOS-000000.svg?logo=apple&variant=branded&size=md"></a>&nbsp;
  <a href="https://github.com/MadBlast0/Cli-launcher/releases/latest"><img alt="Download for Linux" src="https://www.shieldcn.dev/badge/Download-Linux-FCC624.svg?logo=linux&variant=branded&size=md"></a>
</p>

</div>

## Supported CLIs

| CLI | Package | Type |
| --- | ------- | ---- |
| Claude Code | `@anthropic-ai/claude-code` | npm |
| OpenCode | `opencode-ai` | npm |
| Gemini CLI | `@google/gemini-cli` | npm |
| GitHub Copilot | `@github/copilot` | npm |
| OpenAI Codex | `@openai/codex` | npm |
| Aider | `aider-chat` | pip |
| Kilo Code | `@kilocode/cli` | npm |
| Qwen Code | `@qwen-code/qwen-code` | npm |
| Codebuff | `codebuff` | npm |
| Goose CLI | `@block/goose` | npm |
| PI Coding Agent | `@mariozechner/pi-coding-agent` | npm |
| Crush | `@charmland/crush` | npm |
| Freebuff | `freebuff` | npm |
| Command Code | `command-code` | npm |
| Cursor CLI | standalone | curl |
| Amp CLI | `@sourcegraph/amp` | npm |
| Amazon Q | standalone | wsl/curl |

## Features

- **17 AI coding CLIs** — manage all major terminal AI agents (Claude Code, OpenCode, Gemini CLI, GitHub Copilot, Aider, and more) in one place.
- **Install / Update / Uninstall / Repair** — per-CLI actions with real-time progress feedback. Each CLI gets its own install script generated dynamically for your platform.
- **Open terminal** — launches a terminal (cmd, PowerShell, or your default shell) pre-configured in your chosen working directory.
- **Drag to reorder** — rearrange CLI cards to your preference; layout persists across sessions.
- **Update detection** — checks npm/pip for newer versions (cached 1 hour) and badges each CLI when an update is available.
- **Cross-platform** — Windows (`.ps1` scripts), macOS & Linux (`.sh` scripts). Packaged as native installers for each OS.

## Installation

Download the latest release for your platform from the [Releases page](https://github.com/MadBlast0/Cli-launcher/releases/latest).

| Platform | Format | Arch |
| -------- | ------ | ---- |
| Windows | `.msi` installer | x64 |
| Windows | `.exe` installer (NSIS) | x64 |
| Windows | Portable `.exe` | x64 |
| macOS | `.dmg` (universal) | x64 + arm64 |
| macOS | `.dmg` (Intel) | x64 |
| macOS | `.dmg` (Apple Silicon) | arm64 |
| macOS | `.zip` (universal) | x64 + arm64 |
| Linux | `.AppImage` | x64, arm64 |
| Linux | `.deb` | x64, arm64 |
| Linux | `.rpm` | x64, arm64 |
| Linux | `.tar.gz` | x64, arm64 |

Builds are automatically produced by GitHub CI when a new version tag is pushed.

## Stack

- **Electron** 33 — desktop shell
- **React** 19 + **TypeScript** — renderer UI
- **Vite** 6 — build tool
- **Tailwind CSS** 4 — styling
- **electron-builder** 25 — packaging

## Development

```bash
git clone https://github.com/MadBlast0/Cli-launcher.git
cd Cli-launcher
npm install
npm run dev
```

## Build

Build artifacts are output to the `release/` directory.

```bash
npm run build          # current platform
npm run build:win      # Windows (MSI, NSIS, portable, ZIP)
npm run build:mac      # macOS (DMG, ZIP — x64 + arm64)
npm run build:linux    # Linux (AppImage, deb, rpm, snap, pacman)
npm run build:all      # all platforms
```

## CI/CD

Every push to `main` builds the app on Windows, macOS, and Linux and uploads the artifacts. Pushing a tag matching `v*.*.*` (e.g. `v1.0.0`) additionally publishes a [GitHub Release](https://github.com/MadBlast0/Cli-launcher/releases) with all platform builds attached.

The macOS universal binaries (fat binaries containing both x64 and arm64 slices) are produced automatically using `electron-builder --universal`, so a single download works on both Intel and Apple Silicon Macs.

## Star History

<a href="https://star-history.com/#MadBlast0/Cli-launcher&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=MadBlast0/Cli-launcher&type=Date&theme=dark" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=MadBlast0/Cli-launcher&type=Date" />
  </picture>
</a>

## License

MIT
