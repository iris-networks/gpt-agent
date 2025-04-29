# Zenobia Package Registry

This document provides an overview of all packages and applications in the Zenobia monorepo and their purposes.

## Applications

| App | Description |
|---------|-------------|
| `iris` | Headless API for UI automation with browser and computer automation capabilities |

## Infrastructure (`agent-infra`)

| Package | Description |
|---------|-------------|
| `@agent-infra/browser` | Browser automation infrastructure (launch, control, interact) |
| `@agent-infra/logger` | Isomorphic logging utilities for both browser and Node.js |
| `@agent-infra/shared` | Shared utilities and types for agent infrastructure |

## UI Automation Tooling (`ui-tars`)

| Package | Description |
|---------|-------------|
| `@ui-tars/action-parser` | Utilities for parsing user actions into automation commands |
| `@ui-tars/sdk` | Core SDK for UI automation |
| `@ui-tars/shared` | Common types and utilities shared across UI-TARS packages |
| `@ui-tars/utio` | Input/output utilities for UI tasks |

### Operators

| Package | Description |
|---------|-------------|
| `@ui-tars/operator-browser` | Browser-specific automation operators |
| `@ui-tars/operator-nut-js` | Desktop automation operators using nut.js |

## Dependency Graph

```
apps/iris
├── @ui-tars/sdk
│   └── @ui-tars/shared
├── @ui-tars/operator-browser
│   ├── @ui-tars/sdk
│   └── @agent-infra/browser
│       └── @agent-infra/logger
├── @ui-tars/operator-nut-js
│   └── @ui-tars/sdk
├── @ui-tars/shared
├── @ui-tars/utio
├── @agent-infra/browser
│   └── @agent-infra/logger
├── @agent-infra/logger
└── @agent-infra/shared
```

## Adding New Packages or Applications

When adding a new package:

1. For libraries: Create a directory in the appropriate category under `packages/`
2. For applications: Create a directory under `apps/`
3. Add the package/app to this registry
4. Update dependencies in related packages
5. Add the package/app to the workspace references in the root `tsconfig.json`

## Versioning Strategy

Packages in this monorepo follow these versioning guidelines:

- **Application**: Uses standard semantic versioning
- **Libraries**: Follows semantic versioning with special consideration for breaking changes
- **Shared Packages**: Treated with extra care to avoid breaking changes

When updating versions, always run a full build and test to ensure compatibility.