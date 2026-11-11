import type { JsonValue, ToolResultMessage } from "@earendil-works/pi-ai";
import type { TemplateResult } from "lit";

export interface ToolRenderResult {
	content: TemplateResult;
	isCustom: boolean; // true = no card wrapper, false = wrap in card
}

// TDetails must stay JSON-compatible: pi-ai's ToolResultMessage collapses to `never` for `any`/`undefined`.
export interface ToolRenderer<TParams = any, TDetails = JsonValue> {
	render(
		params: TParams | undefined,
		result: ToolResultMessage<TDetails> | undefined,
		isStreaming?: boolean,
	): ToolRenderResult;
}

/**
 * Erased view of a renderer for the tool-name registry. Each registered renderer keeps its own
 * params/details types, and tool-specific result interfaces are not assignable to `JsonValue`
 * (no implicit index signature), so the registry cannot erase TDetails to JsonValue.
 */
export interface AnyToolRenderer {
	render(params: unknown, result: unknown, isStreaming?: boolean): ToolRenderResult;
}
