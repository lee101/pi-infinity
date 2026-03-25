#!/bin/bash
set -eo pipefail

REPO_DIR="/home/lee/code/pi-infinity"
LOG_DIR="$REPO_DIR/scripts/logs"
LOG_FILE="$LOG_DIR/upstream-sync-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== Pi Infinity upstream sync started at $(date) ==="

export HOME="/home/lee"
export PATH="$HOME/.bun/bin:$HOME/.cargo/bin:$HOME/.nvm/versions/node/v22.17.0/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"

set +e
[ -f "$HOME/.profile" ] && source "$HOME/.profile" 2>/dev/null
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" 2>/dev/null
set -e

[ -f "$HOME/.cron-env" ] && source "$HOME/.cron-env"

# unset ANTHROPIC_API_KEY so claude uses its default auth
unset ANTHROPIC_API_KEY

for cmd in claude npm git node; do
    command -v "$cmd" >/dev/null || { echo "FATAL: $cmd not found in PATH"; exit 1; }
done

export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/codex_agent_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

cd "$REPO_DIR"

if ! git remote get-url upstream &>/dev/null; then
    git remote add upstream https://github.com/badlogic/pi-mono.git
fi

# ensure upstream uses HTTPS (not SSH) for fetch
git remote set-url upstream https://github.com/badlogic/pi-mono.git

git fetch upstream

UPSTREAM_ALREADY_MERGED=$(git merge-base --is-ancestor upstream/main HEAD 2>/dev/null && echo "yes" || echo "no")

if [ "$UPSTREAM_ALREADY_MERGED" = "yes" ]; then
    echo "Already up to date with upstream. Nothing to do."
    exit 0
fi

BEHIND_COUNT=$(git rev-list HEAD..upstream/main --count)
echo "Upstream has $BEHIND_COUNT new commits. Running Claude to merge..."

timeout 3600 claude -p --dangerously-skip-permissions --model sonnet --verbose <<'PROMPT'
You are the automated daily sync bot for Pi Infinity, a fork of badlogic/pi-mono.
Your job: merge upstream/main into our main branch, preserve all customizations, verify everything works, and deploy.

OUR CUSTOMIZATIONS (preserve ALL of these -- if a merge conflict touches these, keep OURS):

1. NPM package name: @codex-infinity/pi-infinity in packages/coding-agent/package.json
2. The mom package depends on @codex-infinity/pi-infinity (packages/mom/package.json)
3. README.md: keep our Pi Infinity branded README, NOT the upstream one
4. Logo/branding files: pi-infinity.webp and any .github/pi-infinity-* files
5. .pi/ and .pinf/ directories contain our custom settings
6. AGENTS.md: keep our version if it differs from upstream
7. scripts/daily-upstream-sync.sh: keep ours
8. CLI flags: --auto-next-steps and --auto-next-idea in packages/coding-agent/src/cli/args.ts

STEPS (execute in order):
1. Run: git diff HEAD..upstream/main --stat (understand what changed)
2. Run: git merge upstream/main --no-edit
3. If conflicts: resolve them preserving our customizations. For branding/naming/README, ALWAYS keep ours. For lock files accept theirs.
4. Verify our customizations are intact:
   - grep -q "pi-infinity" packages/coding-agent/package.json
   - grep -q "pi-infinity" README.md
   If any check fails, investigate and fix.
5. Run: cd /home/lee/code/pi-infinity && npm install
6. Run: cd /home/lee/code/pi-infinity && npm run build
7. Run: cd /home/lee/code/pi-infinity && npm test (if tests exist)
8. Bump patch version: cd /home/lee/code/pi-infinity && npm version patch -ws --no-git-tag-version && node scripts/sync-versions.js
9. Run: npm install (to update lock file with new versions)
10. Commit all changes with message: "Pi Infinity vX.Y.Z - merge upstream + maintain custom features"
11. Run: git push origin main
12. Run: cd /home/lee/code/pi-infinity && npm publish -ws --access public

SAFETY:
- If npm run build fails, try to fix the issue (max 2 attempts). If still failing, abort: git merge --abort && git checkout main
- If tests fail due to our changes, fix them. If upstream tests are broken, skip npm publish but still push the merge.
- If npm publish fails, log the error but don't fail the script (exit 0 still).
- NEVER force push. NEVER rewrite history.
- If >20 conflicting files, abort and log a summary.
PROMPT

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo "WARNING: Claude exited with code $EXIT_CODE"
fi

echo "=== Sync completed at $(date) (exit: $EXIT_CODE) ==="

# keep only last 30 logs
ls -t "$LOG_DIR"/upstream-sync-*.log 2>/dev/null | tail -n +31 | xargs -r rm
