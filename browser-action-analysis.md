# Browser Action System Analysis

## Overview

This document provides an analysis of the browser action system in the Zenobia/Iris project, focusing on how LLM outputs are parsed into coordinates and executed as browser actions. It also outlines how to add a new "navigate" action to the action space.

## How Box Coordinates Work

### 1. Action Definition

Actions are defined in the system prompt that is sent to the LLM (in `tools/prompts.ts`). The LLM outputs actions in a specific format like:

```
Thought: ...
Action: click(start_box='[0.131,0.25,0.131,0.25]')
```

### 2. Coordinate Format

- Box coordinates are provided as normalized values between 0 and 1, representing positions relative to the screen dimensions
- Format: `[x1, y1, x2, y2]` where:
  - `(x1, y1)` is the top-left corner of the box
  - `(x2, y2)` is the bottom-right corner of the box
  - For click actions, the middle point of this box is used

### 3. Parsing Process

The coordinate parsing happens in the `parseBoxToScreenCoords` function in `/src/packages/ui-tars-sdk/utils.ts`. It:

1. Takes the box string, screen width, and screen height as input
2. Parses the string into floating-point numbers
3. Computes the center point of the box
4. Scales the normalized coordinates to actual screen coordinates

```typescript
export const parseBoxToScreenCoords = ({
  boxStr,
  screenWidth,
  screenHeight,
  factors = DEFAULT_FACTORS,
}: {
  boxStr: string;
  screenWidth: number;
  screenHeight: number;
  factors?: Factors;
}) => {
  if (!boxStr) {
    return { x: null, y: null };
  }
  const coords = boxStr
    .replace('[', '')
    .replace(']', '')
    .split(',')
    .map((num) => parseFloat(num.trim()));

  const [x1, y1, x2 = x1, y2 = y1] = coords;
  const [widthFactor, heightFactor] = factors;

  return {
    x: Math.round(((x1 + x2) / 2) * screenWidth * widthFactor) / widthFactor,
    y: Math.round(((y1 + y2) / 2) * screenHeight * heightFactor) / heightFactor,
  };
};
```

## Action Execution Flow

1. **Input to GUIAgent**: User provides an instruction
2. **Screenshot**: The system takes a screenshot of the browser window
3. **LLM Processing**: The screenshot and instruction are sent to the LLM
4. **Action Generation**: The LLM outputs a thought and an action
5. **Action Parsing**: The action is parsed into an action type and action inputs
6. **Coordinate Conversion**: For actions with coordinates, the normalized box coordinates are converted to screen coordinates
7. **Action Execution**: The `BrowserOperator.execute()` method executes the appropriate action handler based on the action type

## Current Action Spaces

The current actions defined in the system prompt (`tools/prompts.ts` and `src/packages/ui-tars-sdk/constants.ts`) are:

```
click(start_box='[x1, y1, x2, y2]')
left_double(start_box='[x1, y1, x2, y2]')
right_single(start_box='[x1, y1, x2, y2]')
drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')
hotkey(key='')
type(content='') #If you want to submit your input, use "\n" at the end of `content`.
scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')
wait() #Sleep for 5s and take a screenshot to check for any changes.
finished()
call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.
```

## Implementation of "navigate" Action

Interestingly, the `handleNavigate` method already exists in the `BrowserOperator` class (line 464-472) but it's not included in the action spaces defined in the prompts. Here's how it works:

```typescript
private async handleNavigate(inputs: Record<string, any>): Promise<void> {
  const page = await this.getActivePage();
  const { url } = inputs;
  this.logger.info(`Navigating to: ${url}`);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });
  this.logger.info('Navigation completed');
}
```

This method is also included in the action type handling in the `execute` method:

```typescript
switch (action_type) {
  case 'navigate':
    await this.handleNavigate(action_inputs);
    break;
  
  // other cases...
}
```

## Adding the "navigate" Action

To add the "navigate" action to the action spaces, we need to update three areas:

### 1. Update the MANUAL.ACTION_SPACES Array in tools/prompts.ts

```typescript
const MANUAL = {
  ACTION_SPACES: [
    `click(start_box='[x1, y1, x2, y2]')`,
    `left_double(start_box='[x1, y1, x2, y2]')`,
    `right_single(start_box='[x1, y1, x2, y2]')`,
    `drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')`,
    `hotkey(key='')`,
    `type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.`,
    `scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')`,
    `navigate(url='https://example.com') #Navigate to a specific URL`,
    `wait() #Sleep for 5s and take a screenshot to check for any changes.`,
    `finished()`,
    `call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.`,
  ],
};
```

### 2. Update the DEFAULT_ACTION_SPACES in src/packages/ui-tars-sdk/constants.ts

```typescript
export const DEFAULT_ACTION_SPACES = `
click(start_box='[x1, y1, x2, y2]')
left_double(start_box='[x1, y1, x2, y2]')
right_single(start_box='[x1, y1, x2, y2]')
drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')
hotkey(key='')
type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.
scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')
navigate(url='https://example.com') #Navigate to a specific URL
wait() #Sleep for 5s and take a screenshot to check for any changes.
finished()
call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.
`;
```

### 3. Update the SYSTEM_PROMPT constant in src/packages/ui-tars-sdk/constants.ts

```typescript
export const SYSTEM_PROMPT = `You are a GUI agent. You are given a task and your action history, with screenshots. You need to perform the next action to complete the task.

## Output Format
\`\`\`
Thought: ...
Action: ...
\`\`\`

## Action Space
click(start_box='[x1, y1, x2, y2]')
left_double(start_box='[x1, y1, x2, y2]')
right_single(start_box='[x1, y1, x2, y2]')
drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')
hotkey(key='')
type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.
scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')
navigate(url='https://example.com') #Navigate to a specific URL
wait() #Sleep for 5s and take a screenshot to check for any changes.
finished()
call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.

## Note
- Write a small plan and finally summarize your next action (with its target element) in one sentence in \`Thought\` part.

## User Instruction
`;
```

No changes are needed for the `BrowserOperator` class since it already contains the `handleNavigate` method and recognizes the 'navigate' action type in its switch statement.

## Conclusion

The "navigate" action is already implemented in the underlying code but simply not exposed in the prompt's action spaces. By updating the prompt templates, we can enable the LLM to use this functionality to navigate to specific URLs directly.