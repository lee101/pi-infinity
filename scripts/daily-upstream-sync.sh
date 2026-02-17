#!/bin/bash
set -euo pipefail

REPO_DIR="/home/lee/code/pi-infinity"
LOG_DIR="$REPO_DIR/scripts/logs"
LOG_FILE="$LOG_DIR/upstream-sync-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== Pi Infinity upstream sync started at $(date) ==="

# Source nvm for node/npm access in cron
export NVM_DIR="/home/lee/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="/home/lee/.bun/bin:$PATH"

cd "$REPO_DIR"

git fetch upstream 2>/dev/null || { git remote add upstream git@github.com:badlogic/pi-mono.git && git fetch upstream; }

UPSTREAM_HEAD=$(git rev-parse upstream/main)
LOCAL_HEAD=$(git rev-parse HEAD)

if [ "$UPSTREAM_HEAD" = "$LOCAL_HEAD" ]; then
    echo "Already up to date with upstream. Nothing to do."
    exit 0
fi

echo "Upstream has new commits. Running Claude to merge..."

CLAUDECODE= claude -p --dangerously-skip-permissions --model opus --verbose <<'PROMPT'
You are maintaining the Pi Infinity fork (badlogic/pi-mono -> lee101/pi-infinity). Merge upstream/main into our main branch carefully.

CRITICAL: Maintain ALL of these Pi Infinity customizations:

1. CLI flags: --auto-next-steps and --auto-next-idea in packages/coding-agent/src/cli/args.ts and their implementation in packages/coding-agent/src/main.ts, packages/coding-agent/src/core/agent-session.ts, packages/coding-agent/src/core/sdk.ts
2. NPM package: @codex-infinity/pinf in packages/coding-agent/package.json
3. piConfig branding: name="pinf", configDir=".pinf" in packages/coding-agent/package.json
4. Binary entry point: packages/coding-agent/bin/ should have pinf entry
5. README.md: Keep our Pi Infinity branded README with the autonomous mode docs, NOT upstream's
6. packages/coding-agent/README.md: Keep our "pinf" branding (not "pi")
7. pi-infinity.webp logo file
8. .gitignore: Keep .pi and .pinf entries
9. Update check in packages/coding-agent/src/config.ts: Must query @codex-infinity/pinf on npm, not upstream package. getUpdateInstruction() points to github.com/lee101/pi-infinity/releases/latest
10. Concise system prompts: packages/coding-agent/src/core/system-prompt.ts should stay concise and focused
11. The pre-commit hook in .husky/pre-commit uses `git add -f` for restaging (needed for gitignored .pi files)
12. docs/AUTONOMOUS_MODE.md and related docs (AUTONOMOUS_FEATURES_SUMMARY.md, CHANGELOG_AUTONOMOUS.md) - keep these
13. .pi/settings.json has custom defaults (defaultProvider, defaultModel, defaultThinkingLevel)
14. .pi/prompts/*.md has concise custom prompts (is.md, pr.md, cl.md) for issue/PR/changelog workflows

If upstream added NEW models or provider files, check if they have verbose prompts and simplify them to match our concise style.
If upstream changed CLI arg structures, adapt our --auto-next-steps and --auto-next-idea flags to match the new structure.

Steps:
1. git merge upstream/main --no-edit (resolve conflicts favoring our customizations)
2. If conflicts, resolve them preserving our features listed above
3. Run: npm install (update dependencies)
4. Run: npm run build (verify it compiles)
5. Run: npm run check (lint/format/typecheck)
6. Run: ./test.sh (run tests)
7. If all pass, bump the patch version: npm run version:patch
8. Commit everything with a clear merge message
9. Run: npm run publish (publish all packages to npm)
10. git push origin main

If the merge has complex conflicts you cannot resolve confidently, abort the merge (git merge --abort) and report what happened. Do not force through broken code.
PROMPT

echo "=== Sync completed at $(date) ==="

# Keep only last 30 logs
ls -t "$LOG_DIR"/upstream-sync-*.log | tail -n +31 | xargs -r rm
