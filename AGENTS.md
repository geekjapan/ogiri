# Repository Guidelines

## Project Structure & Module Organization

This repository is currently minimal: `README.md` contains the project name and `LICENSE` contains the BSD 2-Clause license. Add implementation code under `src/` and keep tests under `tests/` or colocated as `*.test.*` files when the chosen language ecosystem supports that pattern. Put static assets in `assets/` and developer scripts in `scripts/`.

Example future layout:

```text
src/        # application or library source
tests/      # integration and unit tests
assets/     # static files, fixtures, sample data
scripts/    # local automation
```

## Build, Test, and Development Commands

No build system is defined yet. When adding one, document the canonical commands in `README.md` and keep them runnable from the repository root.

Preferred command names:

```sh
make test      # run the full test suite, if Makefile is introduced
make lint      # run formatting and static checks
make build     # create distributable artifacts
```

If using a package manager, prefer its standard scripts, such as `npm test`, `npm run lint`, or `cargo test`, and keep names consistent.

## Coding Style & Naming Conventions

Follow the formatter and linter of the language introduced in `src/`. Check generated formatting files into the repository, for example `.prettierrc`, `ruff.toml`, or `rustfmt.toml`. Use clear, descriptive names; avoid abbreviations except for common domain terms. Keep files focused and organize by feature or domain before splitting by technical type.

## Testing Guidelines

Add tests with the first meaningful implementation. Test file names should mirror the unit under test, for example `src/score.ts` with `tests/score.test.ts` or `src/score_test.py`. Cover normal behavior, edge cases, and error paths. New features should include tests, or the pull request must explain why automated coverage is not practical yet.

## Commit & Pull Request Guidelines

The current history only contains `Initial commit`, so use a simple conventional style going forward: `feat: add scoring model`, `fix: handle empty prompt`, `docs: update setup guide`.

Pull requests should include a short summary, test results, linked issues when applicable, and screenshots or terminal output for user-visible changes. Keep PRs scoped to one concern and avoid mixing formatting churn with behavioral changes.

## Security & Configuration Tips

Do not commit secrets, tokens, local credentials, generated caches, or machine-specific configuration. Use environment variables for private values and document required variables without exposing their contents.
