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

- **17 AI coding CLIs** — manage all major terminal AI agents in one place.
- **Install / Update / Uninstall / Repair** — per-CLI actions with progress feedback.
- **Open terminal** — launches a terminal in your chosen working directory.
- **Drag to reorder** — arrange CLI cards to your preference.
- **Update detection** — checks npm/pip for newer versions (cached 1 hour).
- **Cross-platform** — Windows (`.ps1`), macOS & Linux (`.sh`).

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

```bash
npm run build          # current platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
npm run build:all      # all platforms
```

## Star History

<a href="https://star-history.com/#MadBlast0/Cli-launcher&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=MadBlast0/Cli-launcher&type=Date&theme=dark" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=MadBlast0/Cli-launcher&type=Date" />
  </picture>
</a>

## License

MIT
