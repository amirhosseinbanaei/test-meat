#!/usr/bin/env bash
#
# check.sh — Run ESLint and TypeScript checks on the project.
#
# Usage:
#   bash check.sh [project_dir] [package_manager]
#
# Arguments:
#   project_dir       Optional. Path to the project root. Default: current dir.
#   package_manager   Optional. npm | pnpm | yarn. Auto-detected from lockfiles.
#
# Output: two clearly labelled sections — ESLINT and TYPECHECK — with a final summary.
# Exit code: 0 only if both pass. Non-zero otherwise.

set -uo pipefail

PROJECT_DIR="${1:-.}"
PKG_MGR="${2:-}"

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "ERROR: project_dir does not exist: $PROJECT_DIR" >&2
  exit 2
fi

cd "$PROJECT_DIR"

# Auto-detect package manager if not given.
if [[ -z "$PKG_MGR" ]]; then
  if [[ -f "pnpm-lock.yaml" ]];      then PKG_MGR="pnpm"
  elif [[ -f "yarn.lock" ]];         then PKG_MGR="yarn"
  elif [[ -f "package-lock.json" ]]; then PKG_MGR="npm"
  else
    echo "ERROR: could not detect package manager. Pass it as the second argument." >&2
    exit 2
  fi
fi

# Map to the right run-command. Each path runs through the project's own scripts
# rather than invoking eslint/tsc directly so we respect project configuration.
case "$PKG_MGR" in
  npm)  RUN="npm run"      ;;
  pnpm) RUN="pnpm"         ;;
  yarn) RUN="yarn"         ;;
  *) echo "ERROR: unknown package manager: $PKG_MGR" >&2; exit 2 ;;
esac

# create-next-app provides a `lint` script. We add `typecheck` via the locked config.
# If the project doesn't have these scripts, fall back to direct invocation.
have_script() {
  node -e "process.exit(Object.keys(require('./package.json').scripts||{}).includes('$1') ? 0 : 1)"
}

echo "================================================================"
echo "ESLINT"
echo "================================================================"
if have_script "lint"; then
  $RUN lint
else
  npx --yes eslint .
fi
LINT_EXIT=$?
echo ""

echo "================================================================"
echo "TYPECHECK"
echo "================================================================"
if have_script "typecheck"; then
  $RUN typecheck
else
  npx --yes tsc --noEmit
fi
TYPE_EXIT=$?
echo ""

echo "================================================================"
echo "SUMMARY"
echo "================================================================"
if [[ $LINT_EXIT -eq 0 ]]; then echo "ESLINT     : PASS"; else echo "ESLINT     : FAIL"; fi
if [[ $TYPE_EXIT -eq 0 ]]; then echo "TYPECHECK  : PASS"; else echo "TYPECHECK  : FAIL"; fi
echo "================================================================"

if [[ $LINT_EXIT -ne 0 || $TYPE_EXIT -ne 0 ]]; then
  exit 1
fi
exit 0
