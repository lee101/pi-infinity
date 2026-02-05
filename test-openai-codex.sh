#!/bin/bash
set -e

echo "==================================="
echo "Testing OpenAI Codex Integration"
echo "==================================="
echo ""

# Check if auth.json exists
if [ -f ~/.pi/agent/auth.json ]; then
    echo "✓ auth.json found at ~/.pi/agent/auth.json"
    if grep -q "openai-codex" ~/.pi/agent/auth.json 2>/dev/null; then
        echo "✓ openai-codex credentials found"
    else
        echo "✗ No openai-codex credentials found in auth.json"
        echo "  Run 'pi' and use /login to authenticate"
    fi
else
    echo "✗ No auth.json found"
    echo "  Run 'pi' and use /login to authenticate"
fi

echo ""
echo "Available openai-codex models:"
echo "------------------------------"

cd code/pi-infinity
node packages/coding-agent/dist/cli.js --list-models | grep "openai-codex" || echo "No models found matching 'openai-codex'"

echo ""
echo "Testing model resolution:"
echo "-------------------------"

# Test default model
DEFAULT_MODEL=$(node packages/coding-agent/dist/cli.js --provider openai-codex --print "test" 2>&1 | grep -i "model" | head -1 || echo "Could not determine model")
echo "Default model for openai-codex: $DEFAULT_MODEL"

echo ""
echo "OAuth Provider Info:"
echo "--------------------"
node -e "
const { getOAuthProviders } = require('./packages/ai/dist/utils/oauth/index.js');
const providers = getOAuthProviders();
const codex = providers.find(p => p.id === 'openai-codex');
if (codex) {
  console.log('✓ openai-codex OAuth provider registered');
  console.log('  Name:', codex.name);
  console.log('  Uses callback server:', codex.usesCallbackServer);
} else {
  console.log('✗ openai-codex OAuth provider not found');
}
"

echo ""
echo "==================================="
echo "Test complete!"
echo ""
echo "To login with OpenAI Codex:"
echo "1. Run: pi"
echo "2. Type: /login"
echo "3. Select 'ChatGPT Plus/Pro (Codex Subscription)'"
echo "4. Follow the browser prompts"
echo ""
echo "To use openai-codex models:"
echo "  pi --provider openai-codex 'your prompt'"
echo "  pi --provider openai-codex --model gpt-5.2-codex 'your prompt'"
echo "==================================="
