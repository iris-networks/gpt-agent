# Iris - AI-Powered Browser Automation Platform

Iris is an intelligent RPA (Robotic Process Automation) platform that automates browser tasks using AI agents. Built with NestJS and powered by multiple AI models.

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd iris

# Set up environment
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Add your API keys to `.env`:
```
ANTHROPIC_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PORT=3000
```

### Run with Docker

```bash
# Start the application
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Run Desktop App

```bash
# First, start the Docker container
docker-compose up --build

# Then in another terminal, start the desktop app
pnpm run tauri:dev
```

## Usage

1. **Web UI**: http://localhost:3000
2. **API Docs**: http://localhost:3000/api/docs
3. **VNC Interface**: http://localhost:6901/vnc.html

### Basic Example

Send a POST request to `/api/sessions` with your automation task:

```json
{
  "message": "Go to Google and search for 'AI automation'",
  "operator": "browser"
}
```

## Key Features

- 🤖 AI-powered browser automation
- 📹 Session recording and playback  
- 🔄 Multiple AI model support (Anthropic, OpenAI, Groq)
- 🖥️ Computer vision and GUI interaction
- 📊 Excel/spreadsheet automation
- 🔌 WebSocket real-time updates

## API Endpoints

- `POST /api/sessions` - Create automation session
- `GET /api/sessions/:id` - Get session status
- `POST /api/rpa/upload` - Upload files for processing
- `GET /health` - Health check

## License

AGPL-3.0-or-later