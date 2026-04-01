# Compose

This project uses [Superpowers](https://github.com/obra/superpowers) for agentic development workflows.

## Superpowers Plugin

The superpowers plugin is included as a git submodule at `./superpowers/`. It provides skills for:

- Test-driven development (TDD)
- Systematic debugging
- Brainstorming and design refinement
- Writing and executing implementation plans
- Subagent-driven development
- Code review workflows
- Git worktree management
- Verification before completion

## Getting Started

After cloning, initialize the submodule:

```sh
git submodule update --init --recursive
```

## Updating Superpowers

```sh
git submodule update --remote superpowers
```
