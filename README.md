<p align="center">
  <a href="https://codex-infinity.com/">
    <img src="./pi-infinity.webp" alt="Pi Infinity" height="200">
  </a>
</p>

<h1 align="center">Pi Infinity</h1>

<p align="center"><code>npm i -g @codex-infinity/pi-infinity</code></p>

<p align="center"><strong>Pi Infinity</strong> is a coding agent that can run forever.</p>

<p align="center">Run locally or on <a href="https://codex-infinity.com/">bare metal GPU hardware</a>.</p>

---

## What makes Pi Infinity different?

Two flags turn Pi into a fully autonomous coding agent:

 @ours

```shell
# Autonomous coding -- completes tasks then moves to the next one
pinf --auto-next-steps "fix all lint errors and add tests"

# Fully autonomous -- dreams up and implements improvements forever
pinf --auto-next-steps --auto-next-idea
```

## Quickstart

```shell
npm install -g @codex-infinity/pi-infinity
```

Or use the installer URL:

```shell
curl -fsSL https://raw.githubusercontent.com/lee101/pi-infinity/main/install.sh | sh
```

Then run `pinf` to get started.

### Authentication

Set your API key for any supported provider:

```shell
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=...
pinf "your prompt"
```

## Features

- **Autonomous operation** -- `--auto-next-steps` keeps it working without intervention
- **Idea generation** -- `--auto-next-idea` brainstorms and implements improvements
- **AnyLLM** -- OpenAI, Anthropic, Google, local models, bring your own provider
- **Extensible UI** -- extensions, skills, prompt templates, themes, and regular/fullscreen terminal modes
- **Durable sessions** -- resume, fork, export, compact, and share long-running work
- **Current Pi core** -- tracks the latest upstream agent runtime, provider catalog, auth flows, and tool fixes
- **Local execution** -- runs entirely on your machine
- **GPU cloud** -- deploy on [bare metal GPU hardware](https://codex-infinity.com/) for long-running sessions

## Share your OSS coding agent sessions

If you use pi or other coding agents for open source work, please share your sessions.

Public OSS session data helps improve coding agents with real-world tasks, tool use, failures, and fixes instead of toy benchmarks.

For the full explanation, see [this post on X](https://x.com/badlogicgames/status/2037811643774652911).

To publish sessions, use [`badlogic/pi-share-hf`](https://github.com/badlogic/pi-share-hf). Read its README.md for setup instructions. All you need is a Hugging Face account, the Hugging Face CLI, and `pi-share-hf`.

You can also watch [this video](https://x.com/badlogicgames/status/2041151967695634619), where I show how I publish my `pi-mono` sessions.

I regularly publish my own `pi-mono` work sessions here:

- [badlogicgames/pi-mono on Hugging Face](https://huggingface.co/datasets/badlogicgames/pi-mono)

## Packages

| Package | Description |
|---------|-------------|
| **[@codex-infinity/pi-infinity](packages/coding-agent)** | Interactive coding agent CLI |
| **[@earendil-works/pi-ai](packages/ai)** | Unified multi-provider LLM and image API |
| **[@earendil-works/pi-agent-core](packages/agent)** | Agent runtime and durable harness primitives |
| **[@earendil-works/pi-tui](packages/tui)** | Differential terminal UI library |
| **[@earendil-works/pi-telemetry](packages/telemetry)** | Vendor-neutral telemetry contracts, reference adapter, conformance tests, and typed schemas |
| **[@earendil-works/pi-client](packages/client)** | Typed client for remote agent sessions |
| **[@earendil-works/pi-protocol](packages/protocol)** | Shared agent protocol schemas |

## Development

```bash
npm install --ignore-scripts  # Install pinned dependencies
npm run build:offline         # Build with the checked-in model catalog
npm run check        # Lint, format, and type check
./test.sh            # Run tests (skips LLM-dependent tests without API keys)
./pi-test.sh         # Run pinf from sources
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [AGENTS.md](AGENTS.md) for project-specific rules.

## License

MIT
