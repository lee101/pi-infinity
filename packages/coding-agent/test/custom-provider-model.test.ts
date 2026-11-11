import type { Api, Model } from "@earendil-works/pi-ai";
import { describe, expect, it } from "vitest";
import { buildCustomProviderModel } from "../src/core/model-resolver.ts";
import type { ModelRuntime } from "../src/core/model-runtime.ts";

function model(provider: string, id: string): Model<Api> {
	return {
		id,
		name: id,
		api: "openai-completions",
		provider,
		baseUrl: "https://example.test/v1",
		reasoning: false,
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000,
		maxTokens: 100,
	} as Model<Api>;
}

function runtime(models: Model<Api>[]): ModelRuntime {
	return {
		getModel: (provider: string, id: string) => models.find((m) => m.provider === provider && m.id === id),
		getModels: (provider?: string) => models.filter((m) => !provider || m.provider === provider),
	} as unknown as ModelRuntime;
}

describe("buildCustomProviderModel", () => {
	const models = [model("openrouter", "vendor/known"), model("openpaths", "openpaths/free"), model("anthropic", "a")];

	it("builds an unlisted id on openrouter and openpaths from the provider's own model", () => {
		const rt = runtime(models);
		const router = buildCustomProviderModel(rt, "openrouter", "vendor/brand-new");
		expect(router).toMatchObject({
			provider: "openrouter",
			id: "vendor/brand-new",
			baseUrl: "https://example.test/v1",
		});
		expect(buildCustomProviderModel(rt, "openpaths", "gpt-9")).toMatchObject({ provider: "openpaths", id: "gpt-9" });
	});

	it("returns the catalog model for a known id", () => {
		expect(buildCustomProviderModel(runtime(models), "openrouter", "vendor/known")).toBe(models[0]);
	});

	it("does not invent models for other providers or empty ids", () => {
		const rt = runtime(models);
		expect(buildCustomProviderModel(rt, "anthropic", "claude-x")).toBeUndefined();
		expect(buildCustomProviderModel(rt, "openrouter", "  ")).toBeUndefined();
		expect(buildCustomProviderModel(runtime([]), "openrouter", "x/y")).toBeUndefined();
	});
});
