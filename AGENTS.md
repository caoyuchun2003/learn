# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **VitePress static documentation site** (`learn` — 曹宇春的学习手册库). The top-level book folders (`agent-book/`, `AI应用开发手册/`, `os-book/`, etc.) are Markdown content collections, all rendered by the one VitePress app. There is no backend, database, or external service.

### Service

| Task | Command | Notes |
|------|---------|-------|
| Dev server | `npm run docs:dev` | Serves at `http://localhost:<port>/learn/`. Note the `/learn/` base path (set via `base: '/learn/'` in `.vitepress/config.ts`) — the bare `/` returns 404. |
| Build | `npm run docs:build` | Static output to `.vitepress/dist` (git-ignored). This is what CI/GitHub Pages runs. |
| Preview built site | `npm run docs:preview` | Only meaningful after `docs:build`. |

- Node 22 is the known-good version (matches `.github/workflows/docs.yml`).
- There are **no lint or test scripts** defined in `package.json`; correctness is validated by a successful `docs:build` (and browsing the dev server).
- VitePress is an SPA: the page `<title>` and content render client-side, so a raw `curl` of the HTML shows an empty `<title>` even though the site works — verify in a browser or via HTTP 200, not by grepping server HTML.
- `*.zip` files at the repo root are build artifacts and are excluded from the site via `srcExclude`.
