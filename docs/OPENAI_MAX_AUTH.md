# OpenAI Max Plan Authentication in pi-infinity

## Overview

pi-infinity supports **OpenAI ChatGPT Plus/Pro subscription authentication** (similar to Codex) through OAuth, allowing you to use your ChatGPT Max plan with the pi coding agent.

## Features

- **OAuth-based authentication** - No API key needed
- **Automatic token refresh** - Credentials are automatically refreshed when expired
- **Secure storage** - Tokens stored in `~/.pi/agent/auth.json` with proper permissions (600)
- **Models available**:
  - `gpt-5.2-codex` (alias for latest reasoning model)
  - `gpt-4.5-vision-preview`
  - `gpt-5-64k`
  - `gpt-5-preview`
  - `o1-pro`

## Quick Start

### 1. Install pi-infinity

```bash
cd code/pi-infinity
npm install
npm run build

# Link for local development
npm link -w packages/coding-agent
```

### 2. Login with ChatGPT

Start pi in interactive mode and use the `/login` command:

```bash
pi
```

Then type:
```
/login
```

This will:
1. Show a list of available OAuth providers
2. Select "ChatGPT Plus/Pro (Codex Subscription)"
3. Open your browser for authentication
4. Automatically complete the flow

### 3. Use OpenAI Codex models

After logging in, you can use openai-codex models:

```bash
# Use the default Codex model
pi --provider openai-codex "Hello, what can you do?"

# Use a specific Codex model
pi --provider openai-codex --model gpt-5.2-codex "Write a Python script"

# Use with model cycling
pi --models "openai-codex/*,anthropic/*"
```

### 4. Check your auth status

View logged-in providers:
```
/logout
```

This shows all providers with saved credentials.

## Architecture

The implementation consists of:

1. **OAuth Provider** (`packages/ai/src/utils/oauth/openai-codex.ts`)
   - PKCE-based OAuth flow
   - Local callback server on port 1455
   - Fallback to manual code entry
   - Automatic token refresh

2. **Auth Storage** (`packages/coding-agent/src/core/auth-storage.ts`)
   - File-based credential storage
   - Locked token refresh (prevents race conditions)
   - Runtime API key overrides
   - Fallback chain: Runtime → OAuth → Env vars

3. **API Implementation** (`packages/ai/src/providers/openai-codex-responses.ts`)
   - Uses OpenAI Responses API
   - Supports reasoning effort levels
   - Token extraction from JWT for account ID

## Environment Variables

While OAuth is the primary method, you can also use session tokens directly:

```bash
# Set access token directly (bypasses OAuth)
export OPENAI_API_KEY="your-access-token"

pi --provider openai-codex
```

## Comparison with Codex

| Feature | Codex | pi-infinity |
|---------|-------|-------------|
| OAuth Flow | ✅ Custom | ✅ Same (compatible) |
| Token Refresh | ✅ Auto | ✅ Auto with locking |
| Local Server | ✅ Port varies | ✅ Port 1455 |
| Manual Fallback | ✅ | ✅ |
| Models | Codex-specific | Same + more |

## Troubleshooting

### "Port 1455 already in use"

If the local callback server can't bind to port 1455:
1. The system falls back to manual code entry
2. You'll be prompted to paste the authorization code from the browser

### "Failed to refresh OAuth token"

If token refresh fails:
1. Your credentials are preserved in `auth.json`
2. Use `/login` again to re-authenticate
3. Check that you're still subscribed to ChatGPT Plus/Pro

### "Unknown OAuth provider: openai-codex"

Make sure you're using the built version:
```bash
cd code/pi-infinity
npm run build
```

## Advanced Usage

### Programmatic Access

```typescript
import { AuthStorage, ModelRegistry } from "@mariozechner/pi-coding-agent";

const authStorage = new AuthStorage();
const modelRegistry = new ModelRegistry(authStorage);

// Login programmatically
await authStorage.login("openai-codex", {
  onAuth: ({ url }) => console.log("Visit:", url),
  onPrompt: async ({ message }) => {
    // Prompt user for code
    return await getUserInput(message);
  },
});

// Get API key (auto-refreshes if needed)
const apiKey = await authStorage.getApiKey("openai-codex");
```

### Custom Models

Add custom openai-codex models in `~/.pi/agent/models.json`:

```json
{
  "providers": {
    "openai-codex": {
      "models": {
        "my-custom-model": {
          "api": "openai-codex-responses",
          "provider": "openai-codex",
          "id": "my-custom-model",
          "name": "My Custom Model",
          "input": 0.10,
          "output": 0.40
        }
      }
    }
  }
}
```

## Implementation Details

### PKCE Flow

1. Generate code verifier and challenge (SHA-256)
2. Open authorize URL with challenge
3. User authenticates in browser
4. Receive authorization code via callback/manual entry
5. Exchange code for tokens using verifier
6. Extract account ID from JWT
7. Store tokens in auth.json

### Token Format

```json
{
  "openai-codex": {
    "type": "oauth",
    "access": "jwt-access-token",
    "refresh": "refresh-token",
    "expires": 1234567890000,
    "accountId": "user-..."
  }
}
```

### Refresh Flow

When a token is expired:
1. Acquire exclusive lock on auth.json
2. Re-read file (another instance may have refreshed)
3. Check if still expired
4. Call refresh endpoint if needed
5. Save new tokens
6. Release lock

This prevents multiple pi instances from refreshing simultaneously.
