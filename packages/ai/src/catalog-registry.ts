/**
 * Runtime overrides for the deprecated compat catalog accessors.
 *
 * An app can replace a provider's chat-model list at runtime (for example a
 * browser extension registering the models a provider reported over its list
 * endpoint). The compat `getModels`/`getModel`/`getProviders` statics read
 * through these overrides, so callers written against the old root layout keep
 * seeing the live list instead of the frozen generated catalog.
 *
 * `getGeneratedModels` always returns the pristine generated catalog, which is
 * what callers use as the merge base before registering an override.
 */

import { type BuiltinProvider, getBuiltinModels } from "./providers/all.ts";
import type { Api, Model } from "./types.ts";

const overrides = new Map<string, readonly Model<Api>[]>();

/** Replace a provider's chat-model list for the compat accessors. */
export function registerModels(provider: string, models: readonly Model<Api>[]): void {
	overrides.set(provider, models);
}

/** Drop a provider's runtime override, restoring its built-in list. */
export function resetProviderModels(provider: string): void {
	overrides.delete(provider);
}

/** Pristine generated chat-model catalog for a provider (ignores overrides). */
export function getGeneratedModels(provider: string): readonly Model<Api>[] {
	return getBuiltinModels(provider as BuiltinProvider);
}

/** Registered override for a provider, if any. */
export function getRegisteredModels(provider: string): readonly Model<Api>[] | undefined {
	return overrides.get(provider);
}
