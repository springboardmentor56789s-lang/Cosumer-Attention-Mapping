# Contributing to Consumer Attention Mapping System

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Cosumer-Attention-Mapping.git
   cd Cosumer-Attention-Mapping
   ```
3. **Set up** the upstream remote:
   ```bash
   git remote add upstream https://github.com/springboardmentor56789s-lang/Cosumer-Attention-Mapping.git
   ```
4. **Create a branch** for your feature or fix (see naming convention below)
5. Make your changes, commit, and push to your fork
6. Open a **Pull Request** against `main`

---

## Branch Naming Convention

Use the following format: `type/short-description`

| Type | When to use |
|---|---|
| `feat/` | New feature or enhancement |
| `fix/` | Bug fix |
| `docs/` | Documentation only changes |
| `refactor/` | Code refactoring without feature changes |
| `test/` | Adding or updating tests |
| `chore/` | Maintenance, dependency updates, config changes |

**Examples:**
```
feat/executive-dashboard-kpi
fix/attention-score-calculation
docs/update-setup-guide
```

---

## Commit Message Format

We follow the **Conventional Commits** specification:

```
type(scope): short description (max 72 chars)

Optional longer body explaining what and why.

Optional footer (e.g., Closes #123)
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

**Scopes (optional):** `backend`, `frontend`, `analytics`, `auth`, `reports`, `infra`, `database`

**Examples:**
```
feat(backend): add YOLOv8-based multi-person tracking endpoint
fix(analytics): resolve attention score division-by-zero edge case
docs: update quickstart setup guide for Windows
chore: upgrade FastAPI to 0.115 and update requirements.txt
```

---

## Pull Request Process

1. Ensure your branch is up-to-date with `upstream/main` before opening a PR
2. Fill in the **PR template** completely
3. Link any related issues using `Closes #<issue-number>`
4. Request review from at least one maintainer
5. All checks must pass before merging
6. Squash commits if your PR has many small/wip commits

---

## Code Style Guidelines

### Backend (Python / FastAPI)
- Follow **PEP 8** style
- Use **type hints** on all function signatures
- Use Pydantic schemas for all request/response models
- Keep routers focused — one resource per file

### Frontend (Next.js / React)
- Use **functional components** with hooks (no class components)
- Use **Tailwind CSS** utility classes; avoid inline styles
- Component filenames: `PascalCase.jsx`
- Keep components under ~300 lines; extract sub-components when larger

---

## Reporting Issues

When filing a bug, use the **Bug Report** issue template and include:
- Steps to reproduce
- Expected vs. actual behavior
- Your OS, Python version, and Node version
- Any relevant error logs or screenshots
