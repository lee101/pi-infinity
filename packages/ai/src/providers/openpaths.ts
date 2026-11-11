import { openAICompletionsApi } from "../api/openai-completions.lazy.ts";
import { envApiKeyAuth } from "../auth/helpers.ts";
import { createProvider, type Provider } from "../models.ts";
import type { Model, OpenAICompletionsCompat, ThinkingLevel, ThinkingLevelMap } from "../types.ts";

export const OPENPATHS_BASE_URL = "https://openpaths.io/v1";

/**
 * OpenPaths is a plain OpenAI-compatible gateway, so the remaining request
 * surface is auto-detected correctly from the base URL. `supportsReasoningEffort`
 * is declared explicitly because the gateway accepts `reasoning_effort` for
 * every reasoning model.
 */
const OPENPATHS_COMPAT: OpenAICompletionsCompat = { supportsReasoningEffort: true };

/** Effort ladder shared by every entry below: levels the gateway does not
 * offer are marked unsupported (`null`). */
function effortLadder(...levels: ThinkingLevel[]): ThinkingLevelMap {
	return {
		off: null,
		minimal: levels.includes("minimal") ? "minimal" : null,
		low: levels.includes("low") ? "low" : null,
		medium: levels.includes("medium") ? "medium" : null,
		high: levels.includes("high") ? "high" : null,
		xhigh: levels.includes("xhigh") ? "xhigh" : null,
		max: levels.includes("max") ? "max" : null,
	};
}

const OPENPATHS_MODEL_BASE = {
	api: "openai-completions",
	provider: "openpaths",
	baseUrl: OPENPATHS_BASE_URL,
	compat: OPENPATHS_COMPAT,
} as const;

/**
 * Hand-authored catalog. The OpenPaths gateway serializes the requested model
 * id verbatim as the wire model, so every id below is the gateway's own id or
 * alias (`openpaths/free` is the free stealth route). Ids, context limits, and
 * pricing mirror `GET /v1/models`.
 */
const OPENPATHS_MODELS = [
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/free",
		name: "OpenPaths Free (MissingNo)",
		reasoning: true,
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 262144,
		maxTokens: 131072,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto",
		name: "OpenPaths Auto",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 0.75, output: 3.75, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 64000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto-fast",
		name: "OpenPaths Auto Fast",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 0.15, output: 0.6, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto-cheap",
		name: "OpenPaths Auto Cheap",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 0.2, output: 1.2, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1050000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto-code",
		name: "OpenPaths Auto Code",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 2, output: 12, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1050000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto-reasoning",
		name: "OpenPaths Auto Reasoning",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 2, output: 12, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1050000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/auto-vision",
		name: "OpenPaths Auto Vision",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 0.75, output: 3.75, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/chat-latest",
		name: "OpenPaths Chat Latest",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text"],
		cost: { input: 0.05, output: 0.25, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 32768,
		maxTokens: 8192,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "openpaths/qwen3.8-27b-uncensored",
		name: "Qwen3.8 27B Uncensored",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text"],
		cost: { input: 0.5, output: 4.5, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 32768,
		maxTokens: 32768,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "deepseek-v4-flash",
		name: "DeepSeek V4 Flash",
		reasoning: true,
		thinkingLevelMap: effortLadder("low", "high", "max"),
		input: ["text"],
		cost: { input: 0.15, output: 0.6, cacheRead: 0.003, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 384000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "muse-spark-1.3-contributor",
		name: "Muse Spark 1.3 Contributor",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high", "xhigh"),
		input: ["text", "image"],
		cost: { input: 0.1, output: 0.2, cacheRead: 0.002, cacheWrite: 0 },
		contextWindow: 1048576,
		maxTokens: 131072,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "muse-spark-1.3",
		name: "Muse Spark 1.3",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high", "xhigh", "max"),
		input: ["text", "image"],
		cost: { input: 1.25, output: 4.25, cacheRead: 0.15, cacheWrite: 0 },
		contextWindow: 1048576,
		maxTokens: 131072,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "gpt-6.1-sol",
		name: "GPT 6.1 Sol",
		reasoning: true,
		thinkingLevelMap: effortLadder("low", "medium", "high", "xhigh", "max"),
		input: ["text", "image"],
		cost: { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 0 },
		contextWindow: 1050000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "claude-sonnet-5",
		name: "Claude Sonnet 5",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high", "xhigh"),
		input: ["text", "image"],
		cost: { input: 2, output: 10, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 128000,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "gemini-3.8-flash",
		name: "Gemini 3.8 Flash",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high"),
		input: ["text", "image"],
		cost: { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0 },
		contextWindow: 1048576,
		maxTokens: 65536,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "kimi-k3",
		name: "Kimi K3",
		reasoning: true,
		thinkingLevelMap: effortLadder("low", "high", "max"),
		input: ["text", "image"],
		cost: { input: 3, output: 15, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1048576,
		maxTokens: 131072,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "glm-5.3",
		name: "GLM 5.3",
		reasoning: true,
		thinkingLevelMap: effortLadder("low", "high", "max"),
		input: ["text"],
		cost: { input: 1.4, output: 4.4, cacheRead: 0.26, cacheWrite: 0 },
		contextWindow: 1310720,
		maxTokens: 131072,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "grok-4.6",
		name: "Grok 4.6",
		reasoning: true,
		thinkingLevelMap: effortLadder("minimal", "low", "medium", "high", "xhigh"),
		input: ["text", "image"],
		cost: { input: 2, output: 6, cacheRead: 0.3, cacheWrite: 0 },
		contextWindow: 500000,
		maxTokens: 16384,
	},
	{
		...OPENPATHS_MODEL_BASE,
		id: "or/ember-1",
		name: "Ember 1",
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 3.165, output: 15.825, cacheRead: 0.3165, cacheWrite: 0 },
		contextWindow: 1048576,
		maxTokens: 943718,
	},
] satisfies Model<"openai-completions">[];

/** OpenPaths gateway (https://openpaths.io/v1), including the free stealth
 * route `openpaths/free`. The API key resolves from `OPENPATHS_API_KEY`. */
export function openpathsProvider(): Provider<"openai-completions"> {
	return createProvider({
		id: "openpaths",
		name: "OpenPaths",
		baseUrl: OPENPATHS_BASE_URL,
		auth: { apiKey: envApiKeyAuth("OpenPaths API key", ["OPENPATHS_API_KEY"]) },
		models: OPENPATHS_MODELS,
		api: openAICompletionsApi(),
	});
}
