# Zenobia

Zenobia is a modern monorepo for UI automation tooling that combines browser automation and computer control capabilities.

## Migration Guide

We've restructured the codebase using Turborepo for better monorepo management. Here's how to migrate from the old structure to the new one:

1. **Directory Structure Change**: The main change is moving from `src/` to `packages/` for libraries and `apps/` for applications:
   - Old: `src/agent-infra/logger` → New: `packages/agent-infra/logger`
   - Old: `src/ui-tars/sdk` → New: `packages/ui-tars/sdk`
   - Old: `src/iris` → New: `apps/iris`

2. **Package Names**: Updated package names to use workspace syntax:
   - `"@ui-tars/sdk": "1.2.0"` → `"@ui-tars/sdk": "workspace:*"`

3. **Build System**: Replaced manual build scripts with Turborepo:
   - Old: Complex chained pnpm commands
   - New: Simple `pnpm build` leveraging the Turborepo pipeline

4. **Import Paths**: Updated import paths in TypeScript files:
   - Old: `import { X } from '@agent-infra/logger'` (path in tsconfig pointing to src)
   - New: same import, but path in tsconfig pointing to packages

## Project Structure

This project is organized as a Turborepo monorepo with pnpm workspaces. The structure is:

```
zenobia/
├── apps/                    # Applications live here
│   └── iris/                # Main application
├── packages/                # Libraries live here
│   ├── agent-infra/         # Infrastructure for agents
│   │   ├── browser/         # Browser automation infrastructure
│   │   ├── logger/          # Logging utilities
│   │   └── shared/          # Shared infrastructure utilities
│   └── ui-tars/             # UI automation tooling
│       ├── action-parser/   # Action parsing utilities
│       ├── operators/       # Automation operators
│       │   ├── browser-operator/ # Browser-specific operators
│       │   └── nut-js/      # Desktop automation operators
│       ├── sdk/             # Core SDK
│       ├── shared/          # Shared utilities
│       └── utio/            # UI task I/O utilities
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package.json with scripts
```

## Key Components

- **Iris**: The main application that provides an API for UI automation
- **Agent Infrastructure**: Core infrastructure for agent capabilities
  - **Browser**: Browser automation tools
  - **Logger**: Logging utilities
  - **Shared**: Shared utilities and types
- **UI-TARS**: UI automation tooling
  - **SDK**: Core SDK for UI automation
  - **Operators**: Implementation of specific automation capabilities
  - **Action Parser**: Utilities for parsing user actions
  - **Shared**: Common types and utilities
  - **Utio**: Input/output utilities for UI tasks

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build all packages:
   ```bash
   pnpm build
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Start the application:
   ```bash
   pnpm start
   ```

## Development Workflow

- **Build**: `pnpm build` - Build all packages
- **Dev**: `pnpm dev` - Start development mode
- **Test**: `pnpm test` - Run tests
- **Lint**: `pnpm lint` - Run linting
- **Format**: `pnpm format` - Format code
- **Clean**: `pnpm clean` - Clean build artifacts

## Package Interdependencies

- **iris** depends on UI-TARS packages and Agent Infrastructure
- **ui-tars/operators** depend on UI-TARS SDK and shared packages
- **ui-tars/sdk** depends on shared packages
- **agent-infra/browser** depends on agent-infra/logger

## Adding New Packages

To add a new package:

1. Create a new directory in the appropriate category folder
2. Initialize with `package.json` with the correct workspace dependencies
3. Update `pnpm-workspace.yaml` if adding a new top-level category

## Contributing

Please ensure all code follows the project's coding standards and passes linting and tests before submitting changes.