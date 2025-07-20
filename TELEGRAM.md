# Telegram Integration

Iris can send automation status notifications via Telegram for real-time monitoring of your automation tasks.

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Use the `/newbot` command and follow the instructions
3. Choose a name and username for your bot
4. Copy the bot token provided by BotFather
5. Add this token to your `.env` file as `TELEGRAM_BOT_TOKEN`

### 2. Get Your Chat ID

1. Start a conversation with your newly created bot
2. Send any message to the bot (e.g., "Hello")
3. Visit the following URL in your browser, replacing `<YOUR_BOT_TOKEN>` with your actual bot token:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. Look for the `chat.id` field in the JSON response
5. Add this chat ID to your `.env` file as `TELEGRAM_CHAT_ID`

### 3. Environment Configuration

Add these variables to your `.env` file:
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
```

## Features

Once configured, Iris will automatically send Telegram notifications for:

- **🚀 Session Started**: When a new automation session begins
- **✅ Task Completed**: When automation tasks complete successfully
- **❌ Errors & Failures**: When automation encounters errors
- **📸 Screenshots**: Visual updates of automation progress
- **📊 Status Updates**: Real-time progress information
- **⏱️ Session Duration**: Time taken for task completion

## Notification Examples

### Session Start
```
🚀 Iris Automation Started
Task: Navigate to Google and search for "AI automation"
Session ID: abc123
Started at: 2024-01-15 14:30:25
```

### Task Completion
```
✅ Automation Completed Successfully
Task: Navigate to Google and search for "AI automation"
Duration: 45 seconds
Session ID: abc123
```

### Error Notification
```
❌ Automation Error
Task: Click login button
Error: Element not found after 30 seconds
Session ID: abc123
```

## Troubleshooting

### Bot Not Responding
- Verify your `TELEGRAM_BOT_TOKEN` is correct
- Ensure the bot is not blocked or deleted
- Check that you've started a conversation with the bot

### Messages Not Received
- Verify your `TELEGRAM_CHAT_ID` is correct
- Ensure you've sent at least one message to the bot
- Check that the bot has permission to send messages

### Getting Updates URL Returns Empty
- Make sure you've sent at least one message to your bot first
- Wait a few minutes and try again
- Verify the bot token in the URL is correct

## Privacy & Security

- Bot tokens should be kept secure and never shared publicly
- Only you and your bot can see the messages in your private chat
- Iris only sends automation-related information, no personal data
- You can disable notifications anytime by removing the environment variables