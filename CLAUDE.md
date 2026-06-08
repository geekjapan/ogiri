# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This is a greenfield repository named **ogiri**. As of this writing it contains only:

- `README.md` — project name only
- `LICENSE` — BSD 2-Clause
- `AGENTS.md` — repository conventions for future code

There is **no implementation code, build system, test suite, or chosen language/framework yet.** Do not assume any toolchain exists — when you add the first meaningful code, you are also choosing and establishing the project's stack and commands. Update this file at that point with the real build/lint/test commands so future sessions don't have to rediscover them.

## Conventions (from AGENTS.md)

`AGENTS.md` is the source of truth for repository conventions. Key points to honor when introducing code:

- **Layout:** source under `src/`, tests under `tests/` or colocated as `*.test.*`, static assets/fixtures in `assets/`, automation in `scripts/`.
- **Commands:** when a build system is added, expose canonical commands and document them in `README.md` so they run from the repo root. Prefer `make test` / `make lint` / `make build`, or the package manager's standard scripts (`npm test`, `cargo test`, etc.) — keep names consistent.
- **Style:** check the language's formatter/linter config into the repo (e.g. `.prettierrc`, `ruff.toml`, `rustfmt.toml`). Organize by feature/domain before splitting by technical type.
- **Tests:** add tests with the first meaningful implementation; mirror the unit under test in the test filename. Cover normal, edge, and error paths.
- **Commits:** conventional style (`feat:`, `fix:`, `docs:`). Keep PRs scoped to one concern; don't mix formatting churn with behavioral changes.
