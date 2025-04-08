# BrowserWise Agent Development Guidelines

## Build/Run/Test Commands
- Run examples: `node ./typescript/examples/path/to/example.js`
- Build: `npm run build`
- Typecheck: `npx tsc --noEmit`
- Lint: `npx eslint "**/*.{ts,tsx}"`
- Test single file: `npm test path/to/test.js`

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
- Built on Hyper Express backend with BeeAI Framework for agent implementation
- Uses Node.js as the runtime environment with TypeScript
- Requires WebSocket support for bidirectional communication