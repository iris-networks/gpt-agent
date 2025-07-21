# gpt-agents (aka Iris): The Free, Open-Source AI Agent for Computer Automation

📖 **[Read the Purpose](purpose.md)** - Learn why we created gpt-agents and how it compares to existing solutions.

🌐 **[Try the Cloud Version](https://agent.tryiris.dev)** - Test gpt-agents instantly without any setup.

## 🚀 Getting Started

We've made it straightforward to get gpt-agents (aka Iris) up and running, leveraging familiar developer tools. Our current deployment focus is on Docker, which provides a consistent experience across environments.

**Prerequisites:**
*   Docker
*   Docker Compose

**Setup Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/iris-networks/gpt-agent.git
    cd gpt-agent
    ```

2.  **Environment Configuration:**
    Copy the example environment file and update it with your AI provider API keys.
    ```bash
    cp .env.example .env
    # Edit .env with your keys for Google (Gemini)
    ```
    Your `.env` file will look something like this:
    ```env
    ANTHROPIC_API_KEY=your_anthropic_key_here
    GEMINI_API_KEY=your_gemini_key_here
    PORT=3000
    DISPLAY=:1
    IS_CONTAINERIZED=true

    # Optional: For Telegram notifications
    TELEGRAM_BOT_TOKEN=your_bot_token
    TELEGRAM_CHAT_ID=your_chat_id
    ```
    *For detailed Telegram integration, please refer to the [Telegram Integration Guide](TELEGRAM.md).*

3.  **Run with Docker:**
    To start gpt-agents (aka Iris) and its services:
    ```bash
    docker-compose up --build
    ```
    To run in the background:
    ```bash
    docker-compose up -d --build
    ```

4.  **Desktop Application (Optional):**
    If you wish to use the native desktop interface:
    ```bash
    # Ensure Docker containers are running (from previous step)
    # In a separate terminal, navigate to the project directory and run:
    pnpm run tauri:dev
    ```


## 🗺️ Roadmap

📋 **[View Full Roadmap](ROADMAP.md)** - Our comprehensive development plan to create the leading open-source AI agent platform.

## 🤝 Contributing

Your contributions are vital to making gpt-agent (aka Iris). We welcome developers from all backgrounds to help us build and improve this platform, particularly in expanding its reach across different operating systems.

## 📄 License
gpt-agents (aka Iris) is licensed under the AGPL-3.0-or-later license.