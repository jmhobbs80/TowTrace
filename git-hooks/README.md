# Git Hooks for TowTrace

This directory contains Git hooks for the TowTrace project.

## Available Hooks

### pre-commit

The pre-commit hook runs before each commit to ensure code quality:

1. Detects which components (backend, frontend, mobile apps) have changes
2. Runs type checking for changed components
3. Runs linting for changed components
4. Fails the commit if any check fails

## Installation

To install these hooks, run the following command from the project root:

```bash
git config core.hooksPath git-hooks
```

This will configure Git to use the hooks in this directory.

## Manual Usage

You can also run the pre-commit hook manually by executing:

```bash
./git-hooks/pre-commit
```

## Bypassing Hooks

In emergency situations, you can bypass the pre-commit hook by using:

```bash
git commit --no-verify
```

However, this should be used with caution as it bypasses important quality checks.