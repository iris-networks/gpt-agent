```ts
while (!goalReached && !aborted && !timeLimitReached) {
  const inputs = ["userInstruction", "screenshot", "history of past actions", "planning steps", "available tools"]
  const output = ["tool to call", "updated plan if something changes", "steps from initial plan that have been successfully completed"]
  const result = toolToCall.execute()
}
```

Feed parts of output back to the input