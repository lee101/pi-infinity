import { openAICompletionsApi } from "../api/openai-completions.lazy.ts";
import { envApiKeyAuth } from "../auth/helpers.ts";
import { createProvider, type Provider } from "../models.ts";
import { META_MODELS } from "./meta.models.ts";

export function metaProvider(): Provider<"openai-completions"> {
	return createProvider({
		id: "meta",
		name: "Meta",
		baseUrl: "https://api.meta.ai/v1",
		auth: { apiKey: envApiKeyAuth("Meta API key", ["META_API_KEY", "MODEL_API_KEY"]) },
		models: Object.values(META_MODELS),
		api: openAICompletionsApi(),
	});
}
