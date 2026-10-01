import { afterEach, describe, expect, it } from "vitest";
import { getModel, streamSimple } from "../src/compat.ts";
import { findEnvKeys, getEnvApiKey } from "../src/env-api-keys.ts";
import { builtinProviders } from "../src/providers/all.ts";

const originalMetaApiKey = process.env.META_API_KEY;
const originalModelApiKey = process.env.MODEL_API_KEY;

afterEach(() => {
	if (originalMetaApiKey === undefined) {
		delete process.env.META_API_KEY;
	} else {
		process.env.META_API_KEY = originalMetaApiKey;
	}
	if (originalModelApiKey === undefined) {
		delete process.env.MODEL_API_KEY;
	} else {
		process.env.MODEL_API_KEY = originalModelApiKey;
	}
});

describe("Meta models", () => {
	it("serves Muse Spark 1.3 tiers with vision and 1M context", () => {
		for (const [id, cost] of [
			["muse-spark-1.3", { input: 1.25, output: 4.25, cacheRead: 0.15, cacheWrite: 0 }],
			["muse-spark-1.3-contributor", { input: 0.1, output: 0.2, cacheRead: 0.002, cacheWrite: 0 }],
		] as const) {
			const model = getModel("meta", id);
			expect(model.api).toBe("openai-completions");
			expect(model.baseUrl).toBe("https://api.meta.ai/v1");
			expect(model.input).toEqual(["text", "image"]);
			expect(model.contextWindow).toBe(1048576);
			expect(model.maxTokens).toBe(131072);
			expect(model.cost).toEqual(cost);
			expect(model.compat).toBeUndefined();
		}
	});

	it("registers the Meta provider for login discovery", () => {
		const provider = builtinProviders().find((candidate) => candidate.id === "meta");
		expect(provider?.name).toBe("Meta");
		expect(provider?.baseUrl).toBe("https://api.meta.ai/v1");
	});

	it("prefers META_API_KEY and falls back to MODEL_API_KEY", () => {
		delete process.env.META_API_KEY;
		delete process.env.MODEL_API_KEY;
		expect(findEnvKeys("meta")).toBeUndefined();

		process.env.MODEL_API_KEY = "test-model-key";
		expect(findEnvKeys("meta")).toEqual(["MODEL_API_KEY"]);
		expect(getEnvApiKey("meta")).toBe("test-model-key");

		process.env.META_API_KEY = "test-meta-key";
		expect(findEnvKeys("meta")).toEqual(["META_API_KEY", "MODEL_API_KEY"]);
		expect(getEnvApiKey("meta")).toBe("test-meta-key");
	});

	it("sends a streaming chat payload to the Meta endpoint", async () => {
		const model = getModel("meta", "muse-spark-1.3");
		let payload: Record<string, unknown> | undefined;

		await streamSimple(
			model,
			{ messages: [{ role: "user", content: "test", timestamp: 0 }] },
			{
				apiKey: "test-meta-key",
				onPayload: (value) => {
					payload = value as Record<string, unknown>;
					throw new Error("payload captured");
				},
			},
		).result();

		expect(payload?.model).toBe("muse-spark-1.3");
		expect(payload?.stream).toBe(true);
	});
});
