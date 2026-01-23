# NexusCanon-AXIS Documentation

> Documentation organized using the [Diátaxis framework](https://diataxis.fr/)

## Quick Links

| Section | Purpose | For |
|---------|---------|-----|
| [Tutorials](./tutorials/) | Learning-oriented | New developers |
| [How-to Guides](./how-to/) | Task-oriented | Problem solvers |
| [Reference](./reference/) | Information-oriented | Fact checkers |
| [Explanation](./explanation/) | Understanding-oriented | Deep learners |

---

## Documentation Structure

```
docs/
├── tutorials/           # "Help me learn"
│   ├── getting-started.md
│   ├── first-tenant.md
│   ├── deploy-to-vercel.md
│   └── production-setup.md   # NEW: External service config
│
├── how-to/              # "Help me solve a problem"
│   ├── add-team-member.md
│   ├── configure-stripe.md
│   ├── setup-api-keys.md
│   └── manage-branding.md
│
├── reference/           # "Help me find information"
│   ├── api/
│   ├── database/
│   └── environment.md
│
└── explanation/         # "Help me understand"
    ├── architecture.md
    ├── multi-tenancy.md
    └── authentication.md
```

---

## Diátaxis Framework

### The Four Quadrants

| | Practical | Theoretical |
|---|---|---|
| **Learning** | Tutorials | Explanation |
| **Working** | How-to Guides | Reference |

### Writing Guidelines

**Tutorials** - Guide learners through a series of steps
- Use "we" language: "First, we will..."
- Show, don't tell
- Focus on one path to success

**How-to Guides** - Solve a specific problem
- Start with the goal: "How to..."
- Assume knowledge
- Be direct and practical

**Reference** - Describe the machinery
- Be accurate and complete
- Follow a consistent structure
- Don't explain concepts (link to Explanation)

**Explanation** - Clarify and illuminate
- Discuss "why" and trade-offs
- Provide context and history
- Connect to broader concepts

---

## Contributing

1. Identify which quadrant your content belongs in
2. Follow the writing guidelines for that quadrant
3. Link between quadrants when appropriate
4. Keep tutorials beginner-friendly
5. Keep reference docs comprehensive

---

## Related Resources

- [Root README](../README.md) - Project overview
- [E2E Testing](./E2E-TESTING.md) - Testing strategy
- [Scripts README](../scripts/README.md) - Utility scripts
