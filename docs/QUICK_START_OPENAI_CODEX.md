# Quick Start: OpenAI Codex (ChatGPT Max Plan)

## TL;DR

```bash
# 1. Build
cd ~/code/pi-infinity
npm install && npm run build

# 2. Login
node packages/coding-agent/dist/cli.js
# Then type: /login
# Select "ChatGPT Plus/Pro (Codex Subscription)"

# 3. Use it
node packages/coding-agent/dist/cli.js --provider openai-codex "your prompt here"
```

## What You Get

- **No API Key Needed**: Uses your ChatGPT Plus/Pro/Max subscription
- **5 GPT Models**: gpt-5.1, gpt-5.1-codex-max, gpt-5.1-codex-mini, gpt-5.2, gpt-5.2-codex
- **272K Context**: Huge context window for large codebases
- **Automatic Token Refresh**: Never worry about expired tokens
- **Same Flow as Codex**: Compatible with Codex's OAuth implementation

## Step-by-Step

### 1. Build the project
```bash
cd ~/code/pi-infinity
npm install
npm run build
```

### 2. Start interactive mode
```bash
node packages/coding-agent/dist/cli.js
```

### 3. Login
Type at the prompt:
```
/login
```

Select "ChatGPT Plus/Pro (Codex Subscription)" from the list.

Your browser will open to `auth.openai.com`. Complete the login flow.

The terminal will automatically receive the token when done.

### 4. Verify
Your credentials are now saved:
```bash
cat ~/.pi/agent/auth.json
```

Should contain an `openai-codex` entry.

### 5. Use openai-codex models
```bash
# Interactive mode
node packages/coding-agent/dist/cli.js --provider openai-codex

# One-shot mode
node packages/coding-agent/dist/cli.js --provider openai-codex -p "Write a sorting algorithm"

# Specific model
node packages/coding-agent/dist/cli.js --provider openai-codex --model gpt-5.1-codex-mini

# Model cycling (Ctrl+P to switch)
node packages/coding-agent/dist/cli.js --models "openai-codex/*,anthropic/*"
```

## Available Models

| Model | Context | Output | Notes |
|-------|---------|--------|-------|
| gpt-5.1 | 272K | 128K | Latest reasoning model |
| gpt-5.1-codex-max | 272K | 128K | Max quality |
| gpt-5.1-codex-mini | 272K | 128K | Faster, cheaper |
| gpt-5.2 | 272K | 128K | Newest version |
| gpt-5.2-codex | 272K | 128K | **Default** |

## Slash Commands

Once logged in:

- `/login` - Add/switch OAuth providers
- `/logout` - Remove credentials
- `/model` - Switch models
- `Ctrl+P` - Cycle through models
- `/help` - Show all commands

## Docs

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Full setup documentation
- **[OPENAI_MAX_AUTH.md](./OPENAI_MAX_AUTH.md)** - Architecture and advanced usage
- **[test-openai-codex.sh](../test-openai-codex.sh)** - Verification script

## Troubleshooting

**Q: Models don't show in `--list-models`?**  
A: They only appear after you login with `/login`. This is by design.

**Q: "Port 1455 already in use"?**  
A: No problem - you'll be prompted to paste the authorization code manually.

**Q: Token expired?**  
A: Tokens auto-refresh. If refresh fails, just `/login` again.

**Q: "Failed to refresh OAuth token"?**  
A: Use `/login` to re-authenticate. Could be network issues or expired subscription.

## Comparison to Standard pi

| | Standard pi | pi-infinity with openai-codex |
|---|---|---|
| OpenAI Access | API key required | ChatGPT subscription |
| Cost | Pay per token | Fixed subscription |
| Models | gpt-4, gpt-4o, etc. | gpt-5.1/5.2 codex models |
| Context | Up to 128K | Up to 272K |
| Setup | Set `OPENAI_API_KEY` | Run `/login` |

## Link for Development

To use `pi` command instead of the full path:

```bash
cd ~/code/pi-infinity
npm link -w packages/coding-agent

# Now you can use:
pi --provider openai-codex
```

## What's Next?

1. ✅ Login complete
2. Try it: `pi --provider openai-codex "explain async/await"`
3. Compare: Test same prompt with `--provider anthropic`
4. Cycle: Use `--models "openai-codex/*,anthropic/*"` and press `Ctrl+P`

---

**Ready to code!** Your fork has full OpenAI Max plan authentication via the `openai-codex` provider. 🎉
