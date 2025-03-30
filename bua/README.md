# WebDriver BiDi Automation Guide

## Overview
This guide covers how to automate a Chromium-based browser using WebDriver BiDi. It outlines the available functionalities:
- Take a screenshot
- Find element coordinates
- Click and type
- Open a new tab
- Switch to a different tab
- Scroll

## Prerequisites
- Install Chrome or a Chromium-based browser.
- Start Chrome with WebDriver BiDi support:
  ```sh
  google-chrome --headless --remote-debugging-port=9222
  ```
  (For Windows, use `chrome.exe --remote-debugging-port=9222`)
- Install WebSocket support in Node.js:
  ```sh
  npm install ws
  ```

## Setup WebSocket Connection
```ts
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:9222/session");

ws.on("open", () => {
  console.log("Connected to WebDriver BiDi");

  ws.send(JSON.stringify({
    id: 1,
    method: "session.new",
    params: { capabilities: {} }
  }));
});

ws.on("message", (data) => {
  console.log("Received:", data.toString());
});
```

## Open a New Tab
```ts
ws.send(JSON.stringify({
  id: 2,
  method: "browsingContext.create",
  params: { type: "tab" }
}));
```

## Switch to a Different Tab
```ts
ws.send(JSON.stringify({
  id: 3,
  method: "browsingContext.activate",
  params: { context: "<INSERT_CONTEXT_ID>" }
}));
```

## Navigate to a URL
```ts
ws.send(JSON.stringify({
  id: 4,
  method: "browsingContext.navigate",
  params: {
    context: "<INSERT_CONTEXT_ID>",
    url: "https://example.com"
  }
}));
```

## Find Element Coordinates
```ts
ws.send(JSON.stringify({
  id: 5,
  method: "script.callFunction",
  params: {
    context: "<INSERT_CONTEXT_ID>",
    functionDeclaration: "(selector) => { const el = document.querySelector(selector); return el ? el.getBoundingClientRect() : null; }",
    arguments: [{ type: "string", value: "#target-element" }]
  }
}));
```

## Click an Element
```ts
ws.send(JSON.stringify({
  id: 6,
  method: "script.callFunction",
  params: {
    context: "<INSERT_CONTEXT_ID>",
    functionDeclaration: "(selector) => document.querySelector(selector)?.click()",
    arguments: [{ type: "string", value: "#button" }]
  }
}));
```

## Type into an Input Field
```ts
ws.send(JSON.stringify({
  id: 7,
  method: "script.callFunction",
  params: {
    context: "<INSERT_CONTEXT_ID>",
    functionDeclaration: "(selector, text) => { const el = document.querySelector(selector); if (el) { el.value = text; } }",
    arguments: [
      { type: "string", value: "#input-field" },
      { type: "string", value: "Hello, World!" }
    ]
  }
}));
```

## Scroll the Page
```ts
ws.send(JSON.stringify({
  id: 8,
  method: "script.callFunction",
  params: {
    context: "<INSERT_CONTEXT_ID>",
    functionDeclaration: "(x, y) => window.scrollTo(x, y)",
    arguments: [
      { type: "number", value: 0 },
      { type: "number", value: 500 }
    ]
  }
}));
```

## Take a Screenshot
```ts
ws.send(JSON.stringify({
  id: 9,
  method: "browsingContext.captureScreenshot",
  params: { context: "<INSERT_CONTEXT_ID>" }
}));
```

## Notes
- Replace `<INSERT_CONTEXT_ID>` with the actual context ID received when opening a new tab.
- Ensure that Chrome is running in BiDi mode before executing commands.

## Conclusion
WebDriver BiDi allows for real-time automation of browsers with WebSockets. This guide covers basic automation tasks like navigation, element interaction, scrolling, and screenshots.

