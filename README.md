# Zenobia Project (NestJS Version)

This is the NestJS version of the Zenobia project, a service for automating UI interactions through browser or computer automation, powered by the UI-TARS framework.

## Key Enhancements

- Complete migration from Express to NestJS framework
- OpenAPI documentation with Swagger UI at /api/docs
- Improved dependency injection and modular architecture
- Type safety with DTO validation

## Setup and Installation

### Prerequisites

- Node.js 20.x or later
- PNPM 8.x or later (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

### Environment Variables

The application uses dotenv for configuration. Copy `.env.example` to `.env` and customize the values:

```
# Server Configuration
PORT=3000                  # Server port
HOST=0.0.0.0               # Server host

# VLM Configuration
VLM_BASE_URL=...           # Visual Language Model API URL
VLM_API_KEY=...            # API key for VLM service
VLM_MODEL_NAME=tgi         # Model name
VLM_PROVIDER=ui_tars_1_5   # VLM provider

# Application Settings
LANGUAGE=en                # Default language
MAX_LOOP_COUNT=10          # Maximum loop iterations
LOOP_INTERVAL_MS=1000      # Loop interval in milliseconds
DEFAULT_OPERATOR=browser   # Default operator type (browser/computer)
```

### Docker Setup

```bash
# Build and run with Docker
docker-compose up --build
```

### OpenAPI Documentation

The API documentation is available at:
- http://localhost:3000/api/docs (when running locally)

## Features

- Session-based automation
- Browser automation (using @ui-tars/operator-browser)
- Computer automation (using @ui-tars/operator-nut-js)
- VNC/noVNC for visual monitoring
- Screenshot capabilities
- RESTful API

## API Endpoints

- `/api/sessions` - Session management
- `/api/config` - Configuration management
- `/api/operators` - Operator management
- `/api/docs` - API documentation

## UI Access

- Web UI: http://localhost:3000/operator-ui.html
- VNC Interface: http://localhost:6901/vnc.html
- Direct VNC connection: localhost:5901

## Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run test coverage
pnpm run test:cov
```



> slow scroll to not miss a page, you can modify the scroll function




ask the planner how to send commands for search to gui agent, it should say search for x, instead of type x in search and press enter


guiAgent should receive the intent instead of click and type



also the entire plan should be sent to guiAgent instead of steps one by one



prevent about:blank, it should open google on a new tab.


GuiAgent doesn't have the history of past actions, and sometimes forgets what to do, and repeats past actions.

fix scroll amount

watch the video corporate slaves and rebels
Add extra prompt that if the ai agent before failed (example couldn't scroll, update the input to ask the agent to explicitly scroll down )

Add the scraper, and store data properly so it can then be used to do some more interesting stuff.
Add capability to open a new page, maybe add it to the main agent itself.
if the backend return 400, 404 etc, the ui on the frontend should reset.


The agent should make a note of it's own username, so it knows where it has replied and it should still keep a track of what it has done so far



gui agent command currently has duplicate instruction, it is being told to go to a page, it already is on

add agent identity variable too, and past step


commands to gui agent
Goto youtube.com, search for 'The Self-Improvement Lie', click on the video result. Scroll down to the comments section and start replying to users one by one. dont reply twice, **DO NOT reply to your own message and do not reply twice**, your username is Bargains20xx. Make sure to be sarcastic and engaging, and keep it short.


Allow multiple steps to be sent to gui element, for example scroll and type ...., and you may just take simple instructions and execute them one after the other. so no logical commands


Auto improve prompt button, to take user input and enhance it




---

Few shot prompt
bad: type 'Kon kon NEET25 main fail ho geya' in reply box
good: type: 'Kon kon NEET25 main fail ho geya' as a reply to user '@sigmaboy'



reply to someone's comment with: ''

instead of command: 'click on the next comment', you should say.. 
'click on reply button for the comment with text: 'this is great!'