import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import { afterEach, describe, expect, it } from "vitest";
import { createHarness, getUserTexts, type Harness } from "./harness.ts";

describe("AgentSession autonomous continuation", () => {
	const harnesses: Harness[] = [];

	afterEach(() => {
		while (harnesses.length > 0) harnesses.pop()?.cleanup();
	});

	it("continues with concrete next steps after a successful run", async () => {
		const harness = await createHarness({ autoNextSteps: true });
		harnesses.push(harness);
		harness.setResponses([
			fauxAssistantMessage("initial objective complete"),
			fauxAssistantMessage("stopped", { stopReason: "aborted" }),
		]);

		await harness.session.prompt("start");

		const prompts = getUserTexts(harness);
		expect(prompts).toHaveLength(2);
		expect(prompts[1]).toContain("next concrete steps");
		expect(prompts[1]).not.toContain("identify three useful improvements");
	});

	it("combines continuation and idea generation in fully autonomous mode", async () => {
		const harness = await createHarness({ autoNextSteps: true, autoNextIdea: true });
		harnesses.push(harness);
		harness.setResponses([
			fauxAssistantMessage("initial objective complete"),
			fauxAssistantMessage("stopped", { stopReason: "aborted" }),
		]);

		await harness.session.prompt("start");

		const autonomousPrompt = getUserTexts(harness)[1];
		expect(autonomousPrompt).toContain("next concrete steps");
		expect(autonomousPrompt).toContain("identify three useful improvements");
		expect(autonomousPrompt).toContain("until a human interrupts");
	});
});
