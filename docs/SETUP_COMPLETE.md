# ✅ OpenAI Max Plan Authentication - Setup Complete!

## Summary

**Good news**: Your pi-infinity fork **already has full OpenAI Max plan style authentication** built in! It's implemented via the `openai-codex` provider, which uses OAuth similar to how Codex works.

## What's Already Working

✅ **OAuth Flow**: Full PKCE-based OAuth login with local callback server  
✅ **Token Management**: Automatic refresh with file locking to prevent race conditions  
✅ **Secure Storage**: Credentials stored in `~/.pi/agent/auth.json` with 600 permissions  
✅ **5 Models Available**:
- `gpt-5.1` - GPT-5.1 (272K context, 128K output)
- `gpt-5.1-codex-max` - GPT-5.1 Codex Max
- `gpt-5.1-codex-mini` - GPT-5.1 Codex Mini (lower cost)
- `gpt-5.2` - GPT-5.2 (272K context, 128K output)
- `gpt-5.2-codex` - GPT-5.2 Codex (default)

## How to Use

### 1. Build the Project

```bash
cd ~/code/pi-infinity
npm install
npm run build
```

### 2. Login with ChatGPT

Start pi in interactive mode:
```bash
node packages/coding-agent/dist/cli.js
```

Or if you've linked it:
```bash
pi
```

Then type:
```
/login
```

This will:
1. Show a list of OAuth providers
2. Select "ChatGPT Plus/Pro (Codex Subscription)"
3. Open your browser at `https://auth.openai.com/oauth/authorize`
4. Complete authentication
5. Return to the terminal automatically

### 3. Verify Login

After logging in, check your credentials:
```bash
cat ~/.pi/agent/auth.json
```

You should see an `openai-codex` entry with `access`, `refresh`, `expires`, and `accountId` fields.

### 4. Use OpenAI Codex Models

Now the openai-codex models will appear in your model list:
```bash
pi --list-models
```

Use them:
```bash
# Use the default model (gpt-5.2-codex)
pi --provider openai-codex "Write a Python script to analyze log files"

# Use a specific model
pi --provider openai-codex --model gpt-5.1-codex-mini "Quick code review"

# Cycle between multiple providers
pi --models "openai-codex/*,anthropic/claude-sonnet*"
```

## Why Models Don't Show Before Login

**By Design**: The `--list-models` command only shows models you can actually use. Models requiring OAuth authentication (like `openai-codex`) are **hidden until you login**. This prevents confusion.

After logging in with `/login`, openai-codex models will appear in:
- `--list-models` output
- Model cycling with `Ctrl+P`
- Model selector in interactive mode

## Architecture Overview

### Files Involved

1. **OAuth Provider** - `packages/ai/src/utils/oauth/openai-codex.ts`
   - Implements PKCE OAuth flow
   - Local callback server on port 1455
   - Fallback to manual code entry
   - Automatic token refresh

2. **Auth Storage** - `packages/coding-agent/src/core/auth-storage.ts`
   - File-based credential storage
   - Locked token refresh (prevents race conditions when multiple pi instances run)
   - Runtime API key overrides
   - Fallback chain: Runtime → OAuth → Env vars

3. **API Implementation** - `packages/ai/src/providers/openai-codex-responses.ts`
   - Uses OpenAI Responses API
   - Supports reasoning effort levels (minimal, low, medium, high, xhigh)
   - Token extraction from JWT for account ID

4. **Model Registry** - `packages/coding-agent/src/core/model-registry.ts`
   - Filters models by auth availability
   - Resolves API keys via AuthStorage
   - Supports custom models from models.json

### Authentication Flow

```
User runs /login
    ↓
Select "ChatGPT Plus/Pro"
    ↓
Generate PKCE verifier + challenge
    ↓
Open browser → auth.openai.com
    ↓
User authenticates
    ↓
Redirect to localhost:1455/auth/callback
    ↓
Exchange code for tokens
    ↓
Extract accountId from JWT
    ↓
Save to ~/.pi/agent/auth.json
    ↓
Models now available!
```

### Token Refresh Flow

```
API call attempted
    ↓
Check if token expired
    ↓
If expired:
  - Acquire exclusive lock on auth.json
  - Re-read file (another instance may have refreshed)
  - Still expired? Call refresh endpoint
  - Save new tokens
  - Release lock
    ↓
Use access token for API call
```

## Comparison with Standard OpenAI API

| Feature | OpenAI API Key | OpenAI Codex (Max Plan) |
|---------|----------------|-------------------------|
| Authentication | API key | OAuth + subscription |
| Billing | Pay-as-you-go | Fixed subscription |
| Models | Official API models | Codex-specific models |
| Context Window | Varies | 272K tokens |
| Token Refresh | N/A | Automatic |
| Setup | Set env var | `/login` command |

## Advanced Usage

### Environment Variables

Set these for OpenAI Codex (optional, OAuth is preferred):

```bash
# If you somehow have a raw access token
export OPENAI_API_KEY="your-access-token"
```

### Custom Models

Add custom openai-codex models in `~/.pi/agent/models.json`:

```json
{
  "providers": {
    "openai-codex": {
      "models": [
        {
          "id": "my-custom-model",
          "name": "My Custom Model",
          "api": "openai-codex-responses",
          "input": ["text", "image"],
          "cost": {
            "input": 1.0,
            "output": 5.0,
            "cacheRead": 0.1,
            "cacheWrite": 0.0
          },
          "contextWindow": 272000,
          "maxTokens": 128000,
          "reasoning": true
        }
      ]
    }
  }
}
```

### Programmatic Usage

```typescript
import { AuthStorage, ModelRegistry, createAgentSession } from "@mariozechner/pi-coding-agent";

const authStorage = new AuthStorage();
const modelRegistry = new ModelRegistry(authStorage);

// Login
await authStorage.login("openai-codex", {
  onAuth: ({ url }) => console.log("Visit:", url),
  onPrompt: async ({ message }) => {
    // Prompt user for code
    return await promptUser(message);
  },
});

// Get API key (auto-refreshes if needed)
const apiKey = await authStorage.getApiKey("openai-codex");

// Create session
const session = await createAgentSession({
  authStorage,
  modelRegistry,
  model: { provider: "openai-codex", id: "gpt-5.2-codex" },
});
```

## Troubleshooting

### "Port 1455 already in use"

The OAuth callback server can't bind. The system will fall back to manual code entry. Just paste the authorization code when prompted.

### "Failed to refresh OAuth token"

Your token refresh failed. Possible causes:
- Network issues
- Expired refresh token
- Subscription lapsed

**Solution**: Use `/login` again to re-authenticate. Your old credentials are preserved and you can retry.

### Models not showing up

Run `pi --list-models` and search for "openai-codex". If you don't see any:
1. Make sure you've logged in with `/login`
2. Check `~/.pi/agent/auth.json` has an `openai-codex` entry
3. Verify the OAuth provider is registered:
   ```bash
   node -e "const {getOAuthProviders} = require('./packages/ai/dist/utils/oauth/index.js'); console.log(getOAuthProviders().find(p => p.id === 'openai-codex'));"
   ```

### Browser doesn't open

The system tries to open your default browser. If it doesn't work:
1. Manually copy the URL from the terminal
2. Paste it into your browser
3. Complete authentication
4. Copy the redirect URL or authorization code
5. Paste it back in the terminal when prompted

## Next Steps

Now that OpenAI Max plan authentication is set up, you can:

1. **Test it**: Login and try a few prompts with openai-codex models
2. **Compare**: Test the same prompt with Anthropic and OpenAI Codex to see performance
3. **Integrate**: Use openai-codex in your workflows with model cycling
4. **Customize**: Add custom models or tweak the provider settings in models.json

## Files Created

- `OPENAI_MAX_AUTH.md` - Detailed documentation
- `SETUP_COMPLETE.md` - This file (setup summary)
- `test-openai-codex.sh` - Quick test script

## Test Script

Run the test script to verify everything:
```bash
cd ~/code/pi-infinity
./test-openai-codex.sh
```

This will:
- Check for auth.json
- Verify OAuth provider registration
- List available models (after you login)
- Show next steps

---

**That's it!** Your fork already has everything needed for OpenAI Max plan authentication. Just use `/login` and start coding! 🚀
