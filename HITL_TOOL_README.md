# Human-in-the-Loop (HITL) Tool

The HITL tool provides a way for agents to request human assistance when they encounter situations requiring human judgment, decision-making, or clarification. It uses Telegram for notifications and polling to communicate with users.

## Features

- **Telegram Integration**: Sends notifications to a configured Telegram chat
- **Polling Mechanism**: Continuously polls for user responses every 15 seconds
- **Timeout Handling**: Configurable timeout (default: 5 minutes) with operation abortion if no response
- **Status Updates**: Provides real-time status updates to the frontend
- **Urgency Levels**: Supports low, medium, and high urgency levels for different types of requests

## Setup

### 1. Create a Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided

### 2. Get Your Chat ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your chat ID from the response

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

## Usage

The HITL tool is automatically available to all agents when properly configured. The PlaywrightAgentTool has direct access to the HITL tool and can use it internally when needed. Other agents can use it by calling:

```typescript
await hitlTool({
  context: "I'm trying to send an email but found multiple email addresses",
  question: "Which email address should I use: work@example.com or personal@example.com?",
  urgency: "medium"
});
```

### Parameters

- **context** (required): The situation context that requires human assistance
- **question** (required): The specific question or request for the human
- **defaultAction** (deprecated): No longer used - operation will be aborted if no response
- **urgency** (optional): Priority level - 'low', 'medium', or 'high' (default: 'medium')

## When Agents Should Use HITL

Agents are instructed to use the HITL tool in these situations:

1. **Ambiguous Instructions**: When user requests are unclear or have multiple interpretations
2. **Critical Decisions**: When making important choices with significant consequences
3. **Missing Information**: When additional context or clarification is needed
4. **Unexpected Errors**: When facing complex issues requiring human expertise
5. **Ethical Considerations**: When tasks involve sensitive content or ethical dilemmas

## Configuration

The following configuration options are available:

- **Poll Timeout**: Default 5 minutes (300,000ms)
- **Poll Interval**: Default 15 seconds (15,000ms)
- **Telegram Bot Token**: Read from `TELEGRAM_BOT_TOKEN` environment variable
- **Telegram Chat ID**: Read from `TELEGRAM_CHAT_ID` environment variable

All HITL tools automatically read their configuration from environment variables and system constants, ensuring consistent configuration across the entire system without requiring any parameter passing.

## Response Format

The tool returns a structured response:

```typescript
{
  success: boolean,
  response: string,
  source: 'human' | 'error',
  note?: string  // Additional error information if applicable
}
```

## Error Handling

- If Telegram credentials are not configured, the tool will log warnings but won't fail
- If no response is received within the timeout period, the entire operation will be aborted
- Network errors are handled gracefully with appropriate error messages

## Security Considerations

- Bot tokens should be kept secure and not exposed in logs
- Only the configured chat ID can provide responses
- All messages are sent over HTTPS through Telegram's API

## Example Workflow

1. Agent encounters a situation requiring human input
2. Agent calls the HITL tool with context and question
3. Tool sends a formatted notification to Telegram
4. User receives notification and responds via Telegram
5. Tool polls Telegram API and receives the response
6. Tool returns the human response to the agent
7. Agent continues execution with the human guidance
8. If no response is received within timeout, the entire operation is aborted

This tool enables seamless human-agent collaboration while maintaining the autonomous nature of the agent system.