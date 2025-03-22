# BrowserWise Agent Development Guidelines

## Build/Run/Test Commands
- Run examples: `bun run ./typescript/examples/path/to/example.ts`
- Build: `bun build ./src/index.ts --outdir ./dist`
- Typecheck: `bun x tsc --noEmit`
- Lint: `bun x eslint "**/*.{ts,tsx}"`
- Test single file: `bun test path/to/test.ts`

## Code Style Guidelines
- **Architecture**: Clean, modular code (<500 lines per file)
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **Imports**: Group imports by source (framework, internal, external)
- **Types**: Use strict TypeScript typing with proper interfaces/types
- **Errors**: Implement comprehensive error handling with custom error classes
- **Documentation**: Include JSDoc comments for public APIs
- **Formatting**: 2-space indentation, trailing commas, single quotes
- **Tools**: Implement timeouts for external tool operations with exponential backoff

## Framework Details
- Built on ElysiaJS backend with BeeAI Framework for agent implementation
- Uses Bun as the runtime environment with TypeScript
- Requires WebSocket support for bidirectional communication