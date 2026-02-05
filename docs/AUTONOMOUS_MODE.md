# Autonomous Mode for pi-infinity

This document describes the autonomous operation features added to pi-infinity, inspired by the codex implementation.

## Features

Two new CLI flags enable fully autonomous operation:

### `--auto-next-steps`

Automatically continues working on the current objectives after each turn completes.

**Behavior:**
- After the agent finishes responding, automatically prompts it to continue
- Breaks down the overall goal into concrete next steps
- Executes steps in order
- Runs relevant tests as needed
- Continues until manually interrupted (Ctrl+C)

**Example:**
```bash
pi --auto-next-steps "Refactor this codebase to use modern TypeScript patterns"
```

### `--auto-next-idea`

After completing the current plan, automatically brainstorms and implements new improvements.

**Behavior:**
- Waits for current work to complete
- Shifts into ideation mode
- Brainstorms at least three concrete improvements
- Picks the highest-impact idea
- Immediately starts executing it
- Continues until manually interrupted

**Example:**
```bash
pi --auto-next-idea "Improve the project's test coverage"
```

### Combined Mode (Fully Autonomous)

Use both flags together for continuous autonomous operation that:
1. Works on current objectives step-by-step
2. When complete, generates new improvement ideas
3. Implements the best idea
4. Repeats indefinitely

**Example:**
```bash
pi --auto-next-steps --auto-next-idea "Build a new feature"
```

## Implementation Details

### Architecture

The autonomous features are implemented using the existing agent follow-up message system:

1. **CLI Arguments**: Added to `cli/args.ts`
   - `--auto-next-steps`: Boolean flag
   - `--auto-next-idea`: Boolean flag

2. **Session Configuration**: Added to `core/agent-session.ts`
   - `autoNextSteps: boolean` property
   - `autoNextIdea: boolean` property
   - `_maybeQueueAutonomousFollowUp()` method

3. **Agent Integration**: Leverages existing `Agent.followUp()` API
   - Autonomous prompts are queued as follow-up messages
   - Agent loop processes them after each turn completes
   - No steering messages means work continues smoothly

### Autonomous Prompt Generation

The system generates context-aware prompts based on:

- **Last assistant message**: Used as summary of completed work
- **Enabled modes**: Different prompts for next-steps vs. ideation
- **Mode combination**: Special handling when both are enabled

Example prompt (both modes):
```
You are in AUTONOMOUS MODE. Do not ask for permission or confirmation.

Continue working autonomously on the current objectives. Break the overall goal 
into concrete next steps, execute them carefully in order, and run relevant 
tests as needed.

After finishing the current plan, shift into ideation mode and brainstorm at 
least three concrete improvements for this project. Pick the highest-impact 
idea and start executing it immediately.

Repeat this cycle indefinitely until a human interrupts you.

Use the latest summary of work below as context when outlining your follow-up actions:

[assistant's last message content]
```

### Event Flow

```
User submits initial prompt
    ↓
Agent processes turn
    ↓
Turn completes (agent_end event)
    ↓
Check for errors/compaction
    ↓
_maybeQueueAutonomousFollowUp()
    ↓
agent.followUp(autonomous prompt)
    ↓
Agent processes autonomous prompt
    ↓
[loop continues until Ctrl+C]
```

## Comparison with Codex

The pi-infinity implementation closely mirrors the codex approach:

### Similarities
- Uses follow-up messages for continuation
- Generates prompts based on last assistant message
- Supports both next-steps and ideation modes
- Combines modes for full autonomy

### Differences
- **Queue-based**: Uses Agent's existing `followUp()` API instead of spawning new turns
- **Integration point**: Hooks into `agent_end` event vs. task completion in codex
- **Message format**: Uses AgentMessage format with timestamp
- **No background notifications**: Relies on follow-up queue visibility in UI

## Usage Tips

1. **Start Simple**: Begin with `--auto-next-steps` on a well-defined task
2. **Monitor Progress**: Keep terminal visible to see what it's working on
3. **Interrupt Safely**: Use Ctrl+C to stop at any time (current turn completes)
4. **Clear Goals**: Provide clear initial prompts for best results
5. **Session Persistence**: Sessions are saved, so you can resume later

## Safety Considerations

- **Tool Execution**: Agent can execute bash commands and modify files
- **Infinite Loop**: Will continue until interrupted
- **Resource Usage**: Long-running sessions consume API tokens
- **Review Changes**: Always review generated code before deploying
- **Use Version Control**: Commit before running to easily revert changes

## Future Enhancements

Potential improvements:
- Token budget limits for autonomous runs
- Configurable stop conditions (time, turns, tokens)
- Autonomous compaction triggers
- Background notifications for autonomous transitions
- Session export after autonomous runs
- Progress indicators for long-running autonomous work
