#!/bin/bash
# Test script for autonomous mode features

set -e

echo "=== Testing pi-infinity Autonomous Mode ==="
echo ""

# Check if pi is built
if [ ! -f "packages/coding-agent/dist/cli.js" ]; then
    echo "Error: pi-infinity not built. Run 'npm run build' first."
    exit 1
fi

PI_CMD="node packages/coding-agent/dist/cli.js"

echo "1. Testing --help to verify new flags..."
$PI_CMD --help | grep -q "auto-next-steps" && echo "✓ --auto-next-steps flag present" || echo "✗ --auto-next-steps flag missing"
$PI_CMD --help | grep -q "auto-next-idea" && echo "✓ --auto-next-idea flag present" || echo "✗ --auto-next-idea flag missing"
echo ""

echo "2. Testing flag parsing..."
# Create a minimal test
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"
echo "console.log('Hello World');" > test.js

echo "Testing --auto-next-steps flag (will exit after 3 seconds)..."
timeout 3 $PI_CMD --auto-next-steps --no-session -p "List files" 2>&1 | head -20 || true
echo ""

echo "Testing --auto-next-idea flag (will exit after 3 seconds)..."
timeout 3 $PI_CMD --auto-next-idea --no-session -p "List files" 2>&1 | head -20 || true
echo ""

echo "Testing both flags together (will exit after 3 seconds)..."
timeout 3 $PI_CMD --auto-next-steps --auto-next-idea --no-session -p "List files" 2>&1 | head -20 || true
echo ""

cd -
rm -rf "$TEST_DIR"

echo "=== Test Complete ==="
echo ""
echo "To manually test autonomous mode:"
echo "  cd pi-infinity"
echo "  node packages/coding-agent/dist/cli.js --auto-next-steps \"Create a simple hello world script\""
echo ""
echo "Use Ctrl+C to stop autonomous mode at any time."
