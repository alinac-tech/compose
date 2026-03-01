# CLAUDE.md — AI Assistant Guide for `compose`

This file provides context, conventions, and workflows for AI assistants (Claude Code and similar tools) working in this repository.

---

## Repository Overview

- **Repository:** `alinac-tech/compose`
- **Owner:** alinac-tech
- **Status:** Initial setup (repository is in early stage; add context here as the project grows)
- **Description:** Update this section with a description of the project's purpose once development begins.

---

## Repository Structure

```
compose/
└── .gitkeep          # Placeholder to initialize the repository
```

> As files and directories are added, keep this section updated with a high-level map of the codebase.

---

## Git Workflow

### Branching Convention

All feature/task branches created by Claude must follow this naming pattern:

```
claude/<short-description>-<session-id>
```

Examples:
- `claude/add-auth-module-Zs8aw`
- `claude/fix-login-bug-AbCd1`

**Never push to `main` or `master` directly.** Always work on a designated feature branch.

### Push Command

Always push with the upstream flag:

```bash
git push -u origin <branch-name>
```

If a push fails due to network errors, retry with exponential backoff:
- Wait 2s, retry
- Wait 4s, retry
- Wait 8s, retry
- Wait 16s, retry

### Commit Messages

Write clear, descriptive commit messages in the imperative mood:

```
Add user authentication module
Fix broken pagination on dashboard
Refactor database connection pooling
```

Avoid vague messages like `update`, `fix stuff`, or `wip`.

### Pull Requests

When creating PRs via `gh pr create`, include:
- A concise title (under 70 characters)
- A summary of what changed and why
- A test plan checklist

---

## Development Workflow

1. **Understand the task** — read existing code and related files before making changes.
2. **Create or switch to the designated branch** — never work on `main`.
3. **Make focused, minimal changes** — avoid over-engineering or unasked-for refactors.
4. **Run tests** before committing (once a test suite is configured).
5. **Commit early and often** with descriptive messages.
6. **Push** to the remote feature branch when done.

---

## Code Conventions

> Update this section once the technology stack is chosen. Below are suggested defaults.

### General

- Prefer editing existing files over creating new ones.
- Do not add comments, docstrings, or type annotations to code you did not change.
- Do not introduce backwards-compatibility shims for removed code.
- Keep solutions simple — avoid premature abstractions or helper utilities for one-time operations.

### Security

- Never introduce command injection, XSS, SQL injection, or other OWASP Top 10 vulnerabilities.
- Validate input only at system boundaries (user input, external APIs).
- Never commit secrets, credentials, or `.env` files.

### File Naming

> Define naming conventions here once a language/framework is established (e.g., `kebab-case` for JS/TS files, `snake_case` for Python).

---

## Testing

> Populate this section once a test framework is configured. Include:
> - How to run tests (`npm test`, `pytest`, etc.)
> - Where tests live
> - Conventions for test file naming and structure

---

## Environment & Configuration

> Document environment variables, `.env.example`, Docker setup, or other environment configuration here once established.

---

## Technology Stack

> Update this section when the stack is decided. For example:
> - **Language:** TypeScript / Python / Go
> - **Framework:** Express / FastAPI / Gin
> - **Database:** PostgreSQL / MongoDB
> - **Build tool:** Vite / Webpack / Make
> - **CI/CD:** GitHub Actions / GitLab CI

---

## Key Files to Know

> As the project grows, list important files and their purpose here. Example:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — AI assistant guide |

---

## Important Reminders for AI Assistants

- **Read before modifying** — always read a file before editing it.
- **Minimal changes** — only change what is necessary for the task.
- **No unnecessary files** — avoid creating files that aren't needed.
- **No emojis** unless explicitly requested.
- **Confirm before destructive actions** — don't `rm -rf`, force-push, or reset hard without user approval.
- **Do not push to `main`** — always use the designated `claude/...` branch.
- **Avoid retrying failed commands** in a loop — diagnose root causes or ask the user.
- **Keep responses concise** — avoid verbose explanations when a short answer suffices.
