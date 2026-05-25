---
name: lint-and-typecheck
description: Runs ESLint (with the React Compiler rules) and the TypeScript type checker against the Next.js 16 project, reporting any violations. Use as the quality gate before the frontend-lead hands work off to qa-lead or back to the orchestrator. Run this after every meaningful change — not just at the end.
allowed-tools: Bash(bash *), Bash(npm *), Bash(npm *), Bash(yarn *), Bash(npx *), Read
---

# Lint and type-check the Next.js 16 project

This skill runs the two checks that gate every FE handoff:

1. **ESLint** with the `next/core-web-vitals`, `next/typescript`, and `react-hooks/recommended-latest` presets active. The hooks preset now includes the React Compiler rules — there is no separate compiler-rules step.
2. **TypeScript** type checking via `tsc --noEmit`. Uses the locked strict config from `scaffold-nextjs-app`.

Both must pass. If either fails, the work is not done.

## When to use

- Before handing the frontend work off to `qa-lead` or back to the `orchestrator`.
- After running any other skill in this folder.
- Whenever a human reports unexpected behaviour — type and lint errors are the first thing to check.

## When NOT to use

- The project hasn't been scaffolded yet — run `scaffold-nextjs-app` first.

## Inputs expected

- `project_dir` — path to the project root (the folder containing `package.json`). Default: `.`.
- `package_manager` — `npm`, `pnpm`, or `yarn`. Auto-detected from lockfile if not given.

## Workflow

1. Read `references/react-compiler-eslint.md` so the FE Lead can correctly interpret compiler-specific rule violations (these are the unusual ones).
2. Run the check script:
   ```bash
   bash ${CLAUDE_SKILL_DIR}/scripts/check.sh <project_dir> <package_manager>
   ```
3. Read the output. The script prints two clearly labelled sections — `ESLINT` and `TYPECHECK` — and exits 0 only if both passed.
4. If either failed:
   - For lint errors, fix the source file. Many compiler-rule violations have a documented manual fix in the reference. **Do not disable the rule** unless the FE Lead approves.
   - For type errors, fix the source file. Do not weaken `tsconfig.json` to silence errors.
   - Re-run this skill.

## Files in this skill

- `scripts/check.sh` — runs ESLint then `tsc --noEmit`, prints a clear pass/fail report.
- `references/react-compiler-eslint.md` — what the React Compiler ESLint rules check, what the violations mean, how to fix them.

## Output

Exit code 0 = both checks passed; handoff is allowed.
Exit code non-zero = at least one check failed; see the printed report for details. Handoff is **not** allowed until this exits 0.
