# Scalar API Reference Integration

This document explains the integration of Scalar API Reference, a beautiful API documentation tool, into the Iris project.

## Overview

[Scalar API Reference](https://docs.scalar.com/scalar-api-reference) provides a modern, user-friendly interface for API documentation, built on top of your existing OpenAPI/Swagger specifications. It offers improved readability, better organization, and a more engaging user experience compared to traditional Swagger UI.

## Features

- **Beautiful Design**: Modern, clean interface with customizable themes
- **Enhanced Readability**: Better formatting of requests, responses, and schemas
- **API Collections**: Logical grouping of endpoints for easier navigation
- **Code Examples**: Syntax-highlighted code samples in multiple languages
- **Interactive Testing**: Built-in request builder for testing endpoints
- **Dark/Light Mode**: Support for different viewing preferences
- **Customization**: Extensive theming and branding options

## Accessing the Documentation

You can access the Scalar API Reference at:

```
http://localhost:3000/api/reference
```

The traditional Swagger UI is still available at:

```
http://localhost:3000/api/docs
```

## Configuration

The Scalar API Reference is configured in two places:

1. **main.ts**: The basic setup and integration with NestJS
2. **scalar.config.js**: Additional customization options

### Main Configuration (main.ts)

The middleware is set up in `main.ts` with these key settings:

```typescript
app.use(
  '/api/reference',
  apiReference({
    spec: document,               // Use the same OpenAPI spec from Swagger
    title: 'Iris API',         // Page title
    description: '...',           // API description
    theme: 'purple',              // Color theme
    logo: '/assets/iris-logo.svg',
    collections: [                // Endpoint grouping
      {
        name: 'Sessions',
        tags: ['sessions', 'videos']
      },
      // ...other collections
    ],
    configPath: './scalar.config.js'  // External configuration
  })
);
```

### Extended Configuration (scalar.config.js)

Additional customization is available in `scalar.config.js`:

```javascript
module.exports = {
  theme: {
    primaryColor: '#6E56CF',
    typography: { /* ... */ },
    sidebar: { /* ... */ },
  },
  codeExamples: {
    languages: ['curl', 'node', 'typescript', 'python', 'go'],
    defaultLanguage: 'typescript',
  },
  features: {
    darkMode: true,
    search: true,
    // ...other features
  }
};
```

## Custom Assets

Custom branding assets are stored in:

- Logo: `/src/public/assets/iris-logo.svg`
- Favicon: `/src/public/assets/iris-favicon.svg`

## Maintaining Documentation

To ensure the Scalar API Reference stays up-to-date:

1. Continue using NestJS decorators (`@ApiOperation`, `@ApiProperty`, etc.) on controllers and DTOs
2. Add JSDoc comments to DTOs for better descriptions
3. Use the `class-validator` decorators for validation rules
4. Organize endpoints with consistent tagging

When adding new endpoints or DTOs, they will automatically appear in both Swagger UI and Scalar API Reference.

## Troubleshooting

If you encounter issues with the Scalar API Reference:

1. Check that the OpenAPI specification is valid (works in Swagger UI)
2. Verify the configuration in both `main.ts` and `scalar.config.js`
3. Ensure custom assets are properly served from the public directory
4. Check browser console for any JavaScript errors

## References

- [Scalar API Reference Documentation](https://docs.scalar.com/scalar-api-reference)
- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)