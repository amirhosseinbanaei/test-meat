# Frontend Team Package

A self-contained Claude Code project that ships one agent (`frontend-lead`) and five skills for building a Next.js 16 + React 19 + TypeScript website.

## Installation

1. Extract this archive somewhere — for example, your desktop:
   ```
   Desktop/
   └── multiagent/
       └── frontend-team/
           ├── CLAUDE.md
           ├── README.md
           └── .claude/
               ├── agents/
               └── skills/
   ```
2. Open the `frontend-team/` folder in your terminal.
3. Make scripts executable (only needed on first install on macOS/Linux):
   ```bash
   chmod +x .claude/skills/scaffold-nextjs-app/scripts/scaffold.sh
   chmod +x .claude/skills/lint-and-typecheck/scripts/check.sh
   ```
4. Run Claude Code from inside `frontend-team/`:
   ```bash
   claude
   ```
5. List the agents and skills to confirm they loaded:
   ```
   /agents
   ```
   You should see `frontend-lead` in the project scope. Skills are visible via `/plugin` or by referring to them by name in prompts.

## Verifying the structure extracted correctly

After extraction, the folder should contain exactly these files. If any `SKILL.md` is missing, the extraction was incomplete — re-extract from the original archive.

```
frontend-team/
├── CLAUDE.md
├── README.md
└── .claude/
    ├── agents/
    │   └── frontend-lead.md                                              (1 file)
    └── skills/
        ├── scaffold-nextjs-app/
        │   ├── SKILL.md
        │   ├── scripts/scaffold.sh
        │   ├── assets/next.config.ts.template
        │   ├── assets/tsconfig.json.template
        │   ├── assets/eslint.config.mjs.template
        │   ├── references/nextjs-16-config.md
        │   └── references/react-compiler-setup.md                        (7 files)
        ├── create-route/
        │   ├── SKILL.md
        │   ├── assets/page.tsx.template
        │   ├── assets/layout.tsx.template
        │   ├── assets/loading.tsx.template
        │   ├── assets/error.tsx.template
        │   ├── assets/not-found.tsx.template
        │   ├── references/app-router-conventions.md
        │   └── references/async-params.md                                (8 files)
        ├── create-component/
        │   ├── SKILL.md
        │   ├── assets/server-component.tsx.template
        │   ├── assets/client-component.tsx.template
        │   ├── references/server-vs-client.md
        │   └── references/react-19-hooks.md                              (5 files)
        ├── create-server-action/
        │   ├── SKILL.md
        │   ├── assets/server-action.ts.template
        │   ├── assets/action-form.tsx.template
        │   ├── references/server-actions.md
        │   └── references/form-hooks.md                                  (5 files)
        └── lint-and-typecheck/
            ├── SKILL.md
            ├── scripts/check.sh
            └── references/react-compiler-eslint.md                       (3 files)
```

**Total: 31 files.** If `find . -type f | wc -l` reports anything other than 31, something didn't extract cleanly.

## First use

Ask the FE Lead to scaffold a new project. From inside Claude Code:

> Use the frontend-lead to scaffold a new Next.js 16 project called `web`.

The FE Lead will invoke the `scaffold-nextjs-app` skill, which runs `create-next-app`, applies the locked configs, installs the React Compiler Babel plugin, and runs a verification build.

After that you can ask for routes, components, and server actions in plain English — the FE Lead picks the right skill automatically based on each skill's `description` frontmatter.

## Notes

- This package is the frontend team **only**. It was extracted from a larger website-agent-system that includes 18 other agents (product, backend, design, growth, etc.).
- The agent file references peer agents like `ux-design-lead`, `backend-lead`, `qa-lead`, etc. in its Handoffs section. Those references are informational — they describe how the FE Lead would coordinate in the full system. In this standalone package, those agents aren't present, and the FE Lead will simply produce its outputs without delegating to them.
- To run the full multi-team system, install the parent `website-agent-system` package instead.
