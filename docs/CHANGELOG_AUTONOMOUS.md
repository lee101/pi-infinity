# Changelog - Autonomous Features

## [Unreleased] - 2026-02-02

### Added
- **`--auto-next-steps` flag**: Automatically continue working on current objectives after each turn
  - Breaks down goals into concrete steps
  - Executes steps in order
  - Runs relevant tests
  - Continues until interrupted (Ctrl+C)
  
- **`--auto-next-idea` flag**: After completing tasks, brainstorm and implement new improvements
  - Shifts into ideation mode when current work is done
  - Generates 3+ improvement ideas
  - Picks highest-impact idea and implements it
  - Continues until interrupted
  
- **Combined autonomous mode**: Use both flags together for fully autonomous operation
  - Works through current objectives
  - Then generates new ideas
  - Implements best idea
  - Repeats indefinitely
  
- **Documentation**:
  - `AUTONOMOUS_MODE.md`: Comprehensive feature documentation
  - `AUTONOMOUS_FEATURES_SUMMARY.md`: Implementation summary
  - Help text examples for autonomous mode usage
  - Test script: `test-autonomous.sh`

### Technical Implementation
- Added CLI argument parsing for autonomous flags
- Extended AgentSession with autonomous capabilities
- Implemented `_maybeQueueAutonomousFollowUp()` method
- Integrated with existing Agent followUp queue system
- Added autonomous prompt generation based on context

### Modified Files
- `packages/coding-agent/src/cli/args.ts`: CLI argument definitions
- `packages/coding-agent/src/core/agent-session.ts`: Autonomous logic
- `packages/coding-agent/src/core/sdk.ts`: Session options
- `packages/coding-agent/src/main.ts`: Option forwarding

### Usage Examples
```bash
# Auto-continue with next steps
pi --auto-next-steps "Refactor the codebase"

# Auto-ideation mode
pi --auto-next-idea "Improve the project"

# Fully autonomous (run forever)
pi --auto-next-steps --auto-next-idea "Build new features"
```

### Notes
- Inspired by and compatible with codex autonomous features
- Leverages existing Agent follow-up message system
- Works with all existing pi features (tools, models, sessions, etc.)
- Safe interruption with Ctrl+C at any time
- Sessions are saved automatically
