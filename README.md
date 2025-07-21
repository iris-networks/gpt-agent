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
    # Edit .env with your keys for Anthropic (Claude) and Google (Gemini)
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

Our goal is to create the most comprehensive open-source AI agent platform, matching and exceeding the capabilities of proprietary solutions like ChatGPT agents. Here's our development roadmap:

### ✅ Phase 1: Core Agent Foundation (COMPLETED)
- [x] **Multi-AI Model Support** - Claude, Gemini, Cerebras integration with ReactAgent
- [x] **Docker-based Deployment** - Ubuntu XFCE desktop environment with full containerization
- [x] **REST API & WebSocket** - NestJS backend with Socket.io real-time communication
- [x] **React Frontend** - Comprehensive web interface (located at iris.rpa)
- [x] **Terminal Access** - Full Unix utilities access via TerminalAgentTool
- [x] **Browser Automation** - Playwright integration with MCP browser server
- [x] **Desktop Control** - RobotJS and X11 tools (wmctrl, xdotool) integration
- [x] **Excel Automation** - ExcelJS integration with comprehensive spreadsheet operations
- [x] **Recording System** - Video recording with FFmpeg and AI-powered captioning
- [x] **RPA Workflows** - Convert recordings into parameterized batch operations

### 🚀 Phase 2: External Service Integration (HIGH PRIORITY)
- [ ] **Email Integration** - Gmail API, Outlook/Exchange automation
- [ ] **Cloud Storage** - Google Drive, Dropbox, OneDrive API integration  
- [ ] **GitHub Integration** - Repository management, CI/CD automation, code review
- [ ] **Communication Platforms** - Slack API, Discord, Microsoft Teams
- [x] **Basic Messaging** - Telegram integration already implemented

### 🔗 Phase 3: Data & Database Layer
- [ ] **Database Connectivity** - PostgreSQL, MySQL, MongoDB integration
- [ ] **SQL Query Builder** - Advanced database operations and ORM support
- [ ] **Data Pipeline** - ETL capabilities and data transformation tools
- [ ] **API Orchestration** - REST/GraphQL client with workflow automation

### 🧠 Phase 4: Advanced Intelligence (Current Strengths to Enhance)
- [x] **Multi-Modal Processing** - Screenshot analysis and visual feedback
- [x] **Task Decomposition** - Basic ReactAgent task breakdown
- [x] **Human-in-the-Loop** - HITL integration for complex decisions
- [ ] **Long-term Memory** - Persistent context beyond conversation sessions
- [ ] **Advanced Planning** - Multi-step optimization and dependency resolution
- [ ] **Intelligent Error Recovery** - Context-aware retry mechanisms and fallback strategies

### 🔐 Phase 5: Enterprise & Security
- [ ] **Multi-User Support** - User management and session isolation
- [ ] **Role-based Access Control** - Granular permissions and security policies
- [ ] **OAuth Integration** - Google, Microsoft, GitHub OAuth providers
- [ ] **Enterprise SSO** - SAML, LDAP, Active Directory integration
- [ ] **Audit Logging** - Comprehensive action tracking and compliance reporting
- [ ] **Resource Quotas** - Usage limits and performance monitoring

### 🌐 Phase 6: Ecosystem & Scale
- [x] **MCP Protocol** - Model Context Protocol for extensible tool integration
- [x] **Composio Integration** - External service connector framework
- [ ] **Plugin Marketplace** - Community-driven extension ecosystem
- [ ] **Custom AI Models** - Local model deployment and fine-tuning support
- [ ] **Multi-language Support** - Localization and international deployment
- [ ] **Mobile Companion** - iOS/Android monitoring and control apps
- [ ] **Horizontal Scaling** - Multi-instance coordination and load balancing

## 📊 Benchmarks & Performance Goals
- **Humanity's Last Exam**: Target >45% accuracy (vs ChatGPT agent's 41.6%)
- **FrontierMath**: Target >30% accuracy with tool use (vs ChatGPT agent's 27.4%)
- **Task Completion Rate**: >95% for supported workflows
- **Response Time**: <500ms for simple tasks, <5s for complex operations
- **Uptime**: 99.9% availability for production deployments

## 🎯 Competitive Advantages
- **100% Open Source** - Full transparency and community-driven development
- **Multi-AI Provider** - Not locked to a single AI provider
- **Self-hostable** - Complete data sovereignty and privacy
- **Extensible Architecture** - Easy customization and plugin development
- **No Usage Limits** - Pay only for your AI provider costs

## 🤝 Contributing

Your contributions are vital to making gpt-agents (aka Iris) the leading free alternative. We welcome developers from all backgrounds to help us build and improve this platform, particularly in expanding its reach across different operating systems.

## 📄 License
gpt-agents (aka Iris) is licensed under the AGPL-3.0-or-later license.