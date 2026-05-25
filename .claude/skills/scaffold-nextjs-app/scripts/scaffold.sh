#!/usr/bin/env bash
#
# scaffold.sh — Bootstrap a Next.js 16 project with the FE team's full locked stack.
#
# Usage:
#   bash scaffold.sh <project_name> [package_manager] [with_jalali]
#
# Arguments:
#   project_name     Required. Folder name for the new project.
#   package_manager  Optional. npm (locked default). pnpm rejected — do not pass pnpm.
#   with_jalali      Optional. true | false. Default: true.
#
# Exits non-zero on any failure so the calling agent can detect it.

set -euo pipefail

PROJECT_NAME="${1:-}"
PKG_MGR="${2:-npm}"
WITH_JALALI="${3:-true}"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "ERROR: project_name is required." >&2
  echo "Usage: bash scaffold.sh <project_name> [package_manager] [with_jalali]" >&2
  exit 1
fi

if [[ "$PKG_MGR" == "pnpm" ]]; then
  echo "ERROR: pnpm is not allowed. The locked stack uses npm. Pass 'npm' or omit (default)." >&2
  exit 1
fi
if [[ "$PKG_MGR" != "npm" && "$PKG_MGR" != "yarn" ]]; then
  echo "ERROR: package_manager must be one of: npm, yarn. npm is the locked default; yarn is tolerated. pnpm is rejected." >&2
  exit 1
fi

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$SKILL_DIR/assets"

echo "==> Scaffolding Next.js 16 project: $PROJECT_NAME"
echo "    Package manager: $PKG_MGR"
echo "    Jalali calendar support: $WITH_JALALI"

# ---------------------------------------------------------------------------
# Step 1 — create-next-app with locked flags. Tailwind is ALWAYS on.
# ---------------------------------------------------------------------------
echo "==> Running create-next-app"
npx --yes create-next-app@latest "$PROJECT_NAME" \
  --typescript \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --tailwind \
  --use-"$PKG_MGR" \
  --skip-install=false

cd "$PROJECT_NAME"

# ---------------------------------------------------------------------------
# Step 2 — overwrite generated configs with locked templates.
# ---------------------------------------------------------------------------
echo "==> Applying locked configs"
cp "$ASSETS_DIR/next.config.ts.template" ./next.config.ts
cp "$ASSETS_DIR/tsconfig.json.template" ./tsconfig.json
cp "$ASSETS_DIR/eslint.config.mjs.template" ./eslint.config.mjs

# ---------------------------------------------------------------------------
# Step 3 — install runtime dependencies.
# ---------------------------------------------------------------------------
case "$PKG_MGR" in
  npm)  INSTALL="npm install"                    ;;
  yarn) INSTALL="yarn add"                       ;;
esac
case "$PKG_MGR" in
  npm)  INSTALL_DEV="npm install --save-dev"     ;;
  yarn) INSTALL_DEV="yarn add -D"                ;;
esac

echo "==> Installing runtime packages"

# State management & data
$INSTALL zod zustand @tanstack/react-query @tanstack/react-query-devtools

# Forms
$INSTALL react-hook-form @hookform/resolvers

# Dates
$INSTALL date-fns
if [[ "$WITH_JALALI" == "true" ]]; then
  $INSTALL date-fns-jalali
fi

# Animation, icons
$INSTALL motion lucide-react

# Auth helpers (FE talks to a separate backend; just need JWT decode + cookies)
$INSTALL jose

# Typed env vars
$INSTALL @t3-oss/env-nextjs

# ---------------------------------------------------------------------------
# Step 4 — install dev dependencies (compiler, lint, tests).
# ---------------------------------------------------------------------------
echo "==> Installing dev packages"

# React Compiler
$INSTALL_DEV babel-plugin-react-compiler@latest

# ESLint preset that includes the React Compiler rules
$INSTALL_DEV eslint-plugin-react-hooks@latest

# Testing
$INSTALL_DEV vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test

# ---------------------------------------------------------------------------
# Step 5 — initialise shadcn/ui.
# ---------------------------------------------------------------------------
echo "==> Initialising shadcn/ui"
# The shadcn CLI creates components.json, the cn() utility, and the ui/ folder.
# We use --yes --defaults to skip prompts; the defaults match our stack.
npx --yes shadcn@latest init --yes --defaults --base-color neutral

# ---------------------------------------------------------------------------
# Step 6 — drop in starter library files AND scaffold the modular folder layout.
# See references/folder-structure.md for the canonical doc.
# ---------------------------------------------------------------------------
echo "==> Creating modular folder structure"

# Common: shared infrastructure used across modules.
mkdir -p src/common/components/ui
mkdir -p src/common/lib
mkdir -p src/common/services
mkdir -p src/common/hooks
mkdir -p src/common/stores
mkdir -p src/common/contexts
mkdir -p src/common/types
mkdir -p src/common/schemas

# Modules: feature folders. Created empty — modules get added per feature.
mkdir -p src/modules

# Move the shadcn CLI's output into the locked location. The CLI placed
# components.json and lib/utils.ts at default paths; we relocate.
# The components.json file is updated to point at common/components/ui.
if [ -f src/lib/utils.ts ]; then
  mv src/lib/utils.ts src/common/lib/utils.ts
  rmdir src/lib 2>/dev/null || true
fi

# shadcn CLI wrote components.json with `"components": "@/components", "utils": "@/lib/utils"`.
# Rewrite it to point at the modular locations.
if [ -f components.json ]; then
  # Update the aliases — sed is fine here, the file is small JSON we control.
  sed -i.bak \
    -e 's|"components": "@/components"|"components": "@/common/components"|g' \
    -e 's|"utils": "@/lib/utils"|"utils": "@/common/lib/utils"|g' \
    -e 's|"ui": "@/components/ui"|"ui": "@/common/components/ui"|g' \
    -e 's|"lib": "@/lib"|"lib": "@/common/lib"|g' \
    -e 's|"hooks": "@/hooks"|"hooks": "@/common/hooks"|g' \
    components.json
  rm -f components.json.bak
fi

echo "==> Adding starter library files"

# env.ts goes in common/lib — it's shared infrastructure.
cp "$ASSETS_DIR/env.ts.template" src/common/lib/env.ts

# Providers file at the app root — wraps the tree in TanStack Query.
cp "$ASSETS_DIR/providers.tsx.template" src/app/providers.tsx

# Drop a sentinel index in modules/ so the empty folder is committable.
cat > src/modules/.gitkeep << 'EOF'
EOF

# Drop a short README inside common/ pointing at the convention doc.
cat > src/common/README.md << 'EOF'
# common/

Shared infrastructure used by many modules. See the canonical convention:
`.claude/skills/scaffold-nextjs-app/references/folder-structure.md`

Dependency rule: `common/` knows nothing about `modules/`. Imports flow
one way: `app/` → `modules/` → `common/`.
EOF

cat > src/modules/README.md << 'EOF'
# modules/

Feature modules. Each subfolder is one feature (auth, blog, dashboard, …).
See `.claude/skills/scaffold-nextjs-app/references/folder-structure.md`.

Rules:
- Modules NEVER import from other modules. Promote shared code to common/.
- Each module exports its public API via index.ts. Other code imports through
  the barrel, not into internals.
EOF

# ---------------------------------------------------------------------------
# Step 7 — sanity check: type-check + lint + build.
# ---------------------------------------------------------------------------
echo "==> Sanity check"
case "$PKG_MGR" in
  npm)  npm run lint && npx tsc --noEmit && npm run build  ;;
  yarn) yarn lint && yarn exec tsc --noEmit && yarn build  ;;
esac

echo ""
echo "==> Done."
echo "    Project created at: ./$PROJECT_NAME"
echo "    Next: wrap RootLayout's children in <Providers> (see src/app/providers.tsx)"
echo "    Start dev server:   cd $PROJECT_NAME && $PKG_MGR run dev"
