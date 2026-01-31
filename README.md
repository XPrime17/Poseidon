# Poseidon - Personal AI Infrastructure

Poseidon is a comprehensive Personal AI Infrastructure (PAI) system built on Claude Code. It provides a structured framework for AI-assisted problem solving, featuring the PAI Algorithm, skill management, and agent orchestration.

## What is PAI?

PAI (Personal AI Infrastructure) is a general problem-solving system that uses the PAI Algorithm to magnify human capabilities. It transforms Claude Code from a code assistant into a comprehensive digital assistant with memory, skills, workflows, and systematic verification.

## Core Components

### The Algorithm (v0.2.24)

The PAI Algorithm is a 7-phase methodology that ensures every task is:
- Properly understood (OBSERVE)
- Thoughtfully analyzed (THINK)
- Systematically planned (PLAN)
- Correctly built (BUILD)
- Properly executed (EXECUTE)
- Rigorously verified (VERIFY)
- Continuously improved (LEARN)

Every response runs through the Algorithm, with depth varying based on task complexity.

### System Architecture

- **Components/** - Modular components that compose the PAI system
  - Algorithm versions and evolution
  - Format and mode selection
  - Workflow routing
  - Documentation routing

- **SYSTEM/** - Core system documentation
  - System architecture
  - Memory system
  - Skill system
  - Hook system
  - Agent system
  - Delegation patterns
  - Browser automation
  - Notification system

- **Tools/** - Utility scripts and tools
  - TypeScript utilities for PAI operations
  - Infrastructure tooling

## Key Features

### 1. Ideal State Criteria (ISC)

Every task is decomposed into verifiable criteria:
- 8 words exactly
- State-based, not action-based
- Binary testable (YES/NO)
- Granular (one concern per criterion)

### 2. Capability Selection

The system intelligently selects and composes capabilities:
- **Research** - Investigation and information gathering
- **Engineer** - Building and implementing solutions
- **Architect** - System design and structure
- **Analyst** - Analysis and evaluation
- **QA** - Testing and verification
- **Security** - Security testing and assessment

### 3. Thinking Tools

Meta-cognitive tools for enhanced problem solving:
- **Council** - Multi-agent debate for exploring approaches
- **RedTeam** - Adversarial analysis to stress-test ideas
- **FirstPrinciples** - Deconstruct problems to fundamentals
- **Science** - Hypothesis-driven experimentation
- **BeCreative** - Extended thinking for creative solutions

### 4. Composition Patterns

Named patterns for combining capabilities:
- **Pipeline** - Sequential domain handoff (A → B → C)
- **TDD Loop** - Build-verify cycle (A ↔ B)
- **Fan-out** - Parallel execution (→ [A, B, C])
- **Fan-in** - Synthesis ([A, B, C] → D)
- **Gate** - Quality gates before progression
- **Escalation** - Model tier upgrade on complexity
- **Specialist** - Deep single-domain expertise

## How It Works

### Response Depth Levels

| Depth | When | Format |
|-------|------|--------|
| **FULL** | Problem-solving, implementation, design, analysis | 7 phases with ISC tasks |
| **ITERATION** | Continuing/adjusting existing work | Condensed: Change + Verify |
| **MINIMAL** | Pure social: greetings, acknowledgments | Header + Summary + Voice |

### Two-Pass Capability Selection

1. **Pass 1: Hook Hints** - AI inference on raw prompt suggests initial capabilities
2. **Pass 2: THINK Validation** - Full context validation against ISC criteria

The ISC criteria are the authority. Hook suggestions are starting points.

## Philosophy

The Algorithm exists because:
1. Hill-climbing requires testable criteria
2. Testable criteria require ISC
3. ISC requires reverse-engineering intent
4. Verification requires evidence
5. Learning requires capturing misses
6. **Nothing escapes** - depth varies, the Algorithm doesn't

**Goal:** Euphoric Surprise (9-10 ratings) from every response.

## Installation & Usage

This repository contains the core PAI system infrastructure. To use PAI:

1. Install [Claude Code](https://claude.com/claude-code)
2. Clone this repository to `~/.claude/skills/PAI/`
3. Configure your personal settings in `USER/` directory (not included in this repo)
4. Start using PAI through Claude Code

## Documentation

Full documentation available in the `SYSTEM/` directory:

- **PAISYSTEMARCHITECTURE.md** - Core system design
- **MEMORYSYSTEM.md** - Memory and state management
- **SKILLSYSTEM.md** - Skill structure and usage
- **THEHOOKSYSTEM.md** - Event hooks and triggers
- **PAIAGENTSYSTEM.md** - Agent spawning and orchestration
- **THEDELEGATIONSYSTEM.md** - Background work patterns
- **BROWSERAUTOMATION.md** - Playwright automation
- **THENOTIFICATIONSYSTEM.md** - Voice and visual notifications

## Contributing

This is a personal infrastructure system. While the architecture is shared here, actual usage requires personal configuration in the `USER/` directory (not included).

## Attribution

- **The Algorithm** - Derived from systematic problem-solving methodologies
- **First Principles** - Framework from Elon Musk's physics-based thinking
- Built on [Claude Code](https://claude.com/claude-code) by Anthropic

## License

MIT License - See LICENSE file for details

## Version

Current Algorithm Version: v0.2.24 (2026-01-29)

---

**"Magnifying human capabilities..."**
