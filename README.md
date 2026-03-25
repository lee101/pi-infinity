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

- **`--auto-next-steps`** -- After each response, automatically continues with the next logical steps (including testing)
- **`--auto-next-idea`** -- Generates and implements new improvement ideas for your codebase

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
- **Local execution** -- runs entirely on your machine
- **GPU cloud** -- deploy on [bare metal GPU hardware](https://codex-infinity.com/) for long-running sessions

## Packages

| Package | Description |
|---------|-------------|
| **[@codex-infinity/pi-infinity](packages/coding-agent)** | Interactive coding agent CLI |
| **[@mariozechner/pi-ai](packages/ai)** | Unified multi-provider LLM API (OpenAI, Anthropic, Google, etc.) |
| **[@mariozechner/pi-agent-core](packages/agent)** | Agent runtime with tool calling and state management |
| **[@mariozechner/pi-mom](packages/mom)** | Slack bot that delegates messages to the pi coding agent |
| **[@mariozechner/pi-tui](packages/tui)** | Terminal UI library with differential rendering |
| **[@mariozechner/pi-web-ui](packages/web-ui)** | Web components for AI chat interfaces |
| **[@mariozechner/pi-pods](packages/pods)** | CLI for managing vLLM deployments on GPU pods |

## Development

```bash
npm install          # Install all dependencies
npm run build        # Build all packages
npm run check        # Lint, format, and type check
./test.sh            # Run tests (skips LLM-dependent tests without API keys)
./pi-test.sh         # Run pi from sources (must be run from repo root)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [AGENTS.md](AGENTS.md) for project-specific rules.

## License

MIT
