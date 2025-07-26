<div align="center">

# 🙌 gpt-agents: Code Less, Make More

*A TypeScript alternative to [OpenHands](https://github.com/All-Hands-AI/OpenHands) - An AI-powered software development platform*

![Weather Demo](demo.gif)

*In this demo, the AI agent processes a complex multi-city weather analysis request - gathering comprehensive meteorological data for Singapore, San Francisco, and New Delhi including current conditions, 12-hour forecasts, 3-day projections, weather alerts, air quality indices, and travel recommendations, then formatting all data into a structured CSV file format. This demonstration is shown in real time with no speedups.*

🎥 **[Watch Full Demo Video](https://youtu.be/KsJ1Nz74MWA)** - See the complete demonstration in action.

[![Contributors](https://img.shields.io/github/contributors/iris-networks/gpt-agent?style=for-the-badge&color=blue)](https://github.com/iris-networks/gpt-agent/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/iris-networks/gpt-agent?style=for-the-badge&color=blue)](https://github.com/iris-networks/gpt-agent/stargazers)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/AGPL-3.0)

[![Try Now](https://img.shields.io/badge/TRY_NOW-agent.tryiris.dev-brightgreen?style=for-the-badge&logo=rocket)](https://agent.tryiris.dev)

📖 **[DOCUMENTATION](purpose.md)** 📊 **[BENCHMARK SCORE](ROADMAP.md)** 

</div>

Welcome to gpt-agents (aka Iris), a TypeScript-powered platform for AI software development agents. 

gpt-agents can do anything a human developer can: modify code, run commands, browse the web, call APIs, and yes—even copy code snippets from StackOverflow.

## 🚀 Getting Started

### Option 1: Try gpt-agents Now
**[🚀 Try on agent.tryiris.dev](https://agent.tryiris.dev)** - Experience gpt-agents instantly in your browser without any setup.

### Option 2: Docker Installation

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
    ```bash
    cp .env.example .env
    # Edit .env with your API keys
    ```
    Your `.env` file:
    ```env
    ANTHROPIC_API_KEY=your_anthropic_key_here
    GEMINI_API_KEY=your_gemini_key_here
    PORT=3000
    DISPLAY=:1
    IS_CONTAINERIZED=true
    ```

3.  **Run with Docker:**
    ```bash
    docker-compose up --build
    ```
    
    The application will be available at http://localhost:3000

4.  **Desktop Application (Optional):**
    ```bash
    pnpm run tauri:dev
    ```


## 🗺️ Roadmap

📋 **[View Full Roadmap](ROADMAP.md)** - Our comprehensive development plan to create the leading open-source AI agent platform.

## 🤝 Contributing

Your contributions are vital to making gpt-agent (aka Iris). We welcome developers from all backgrounds to help us build and improve this platform, particularly in expanding its reach across different operating systems.

## 📄 License
gpt-agents (aka Iris) is licensed under the AGPL-3.0-or-later license.