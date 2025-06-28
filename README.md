# Iris Project [Intelligence for Reactive and Intent-driven Systems]

Iris is a browser automation platform with intelligent processing capabilities for RPA (Robotic Process Automation), powered by the UI-TARS framework and built with NestJS.

## Key Features

- Browser automation through remote control interface
- Recording and playback of user sessions
- Intelligent video processing for RPA analysis
- Integration with AI models for workflow automation
- Complete migration from Express to NestJS framework
- OpenAPI documentation with Swagger UI at /api/docs
- Improved dependency injection and modular architecture
- Type safety with DTO validation

## Security Considerations

When implementing and using the RPA video processing feature, consider the following security measures:

- Validate all uploaded videos for potential security risks
- Implement size and format restrictions for uploads
- Ensure sensitive content in videos is handled appropriately
- Implement access controls for generated RPA steps and recordings
- Store API keys securely using environment variables
- Sanitize user-supplied content before processing
- Implement rate limiting for API endpoints
- Monitor system for unusual activity patterns

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

### API Documentation

The project provides two options for API documentation:

#### Swagger UI
Traditional OpenAPI documentation interface:
- http://localhost:3000/api/docs (when running locally)

#### Scalar API Reference
Beautiful, modern API documentation with enhanced readability:
- http://localhost:3000/api/reference (when running locally)

The Scalar API Reference provides a more user-friendly interface with:
- Improved visual design
- Better organization with collections
- Syntax highlighting for request/response examples
- Interactive request builder
- Dark/light mode support

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
- `/api/docs` - Swagger API documentation
- `/api/reference` - Scalar API Reference documentation
- `/health` - Health check endpoint for Kubernetes monitoring

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


Agent never exits
search for mahatma gandhi on google



---

fix when correct json is not created
fix rpa to make sure you only type partial text when searching for a user, so dropdown might appear.



---
should be able to upload file in the chat itself, we will add the path to this file to the chat itself. also the ui cache should be added dynamically to the chat. Ability to open a new tab should be added as well. All tab details can also be given to puppeteer.


The file upload apis will be different from chat. We can still select these files in chat, which will be provided to the agent as context.
---


Next capability is to allow agent to open a new tab / just use computer use on docker with live reload
Start with adding navigate to action spaces, it might actually work, since support for it can be found in the code

history will not be cleared if we trigger the same socket endpoint
recently uploaded file was not found
operator.close 


we can have multiple agents, and each agent can have a piece of memory, so instead of building the cache globally, for example, guiAgent can have its own cache for all the operations that it performs, and intelligently manage it.!

Agent should give its final response on the chat widget
If max steps are reached, ask the ai to generate a summary with end
check handle scroll function and add custom logic for scroll


----
Allow changing actions instead of thoughts currently.
Change title functionality
RPA functionality, call it RPA playground



----

ability to stop a running process


kubectl logs -n user-sandboxes 2c412058-deployment-844478d675-vx24w



----


use double click to open an app
make computer default
toolName is undefined, and therefore memory updates are also incorrect
Add ability to stop the agent midway



the llm should open all tabs that it wants to perform research on, this should be high level plan, then copy and paste contents from each
file and paste into notepad
then take everything and use a reportSummarizerTool to generate the report. 
maybe have a tool to generate pdf file


ask ai to never use ai overview answers
llm instruciton: if request doesn't make sense, just ask for clarifying question, dont try to solve it if you don't get it

in rpa the message box doesn't automatically close after uploading a file
Allow for clearing the session from agents memory, not happening right now
Excel file reader seems to be messed up
Reduce the number of iterations permitted
Use the lens icon on the desktop to search for system applications

Create all files on /home/vncuser/Desktop and open them afterwards, start by first creating the file and then append stuff to it.
and those tools currently are not broadcasting their work, so its not visible on the chat interface, that should be done too. We dont know if those tool encounter any errors etc ...

Add a terminate button on sandbox, so users can terminate the sandbox
nodeuser should have access to Desktop of vncuser


[x] container is getting killed on first boot


Update the prompt, so that if the main agent asked guiAgent to download a file from the internet, it should verify if the file has already been downloaded once guiAgent, responds by looking at the downloads on chromium navbar's download icon.                                                                                                         



Currently we call create session even for a new message and since we do that what happens is that a new session is created and now we have two GUI agents running at the same time which keep contradicting each other. So we need to change the frontend instead of using create session it should use something else like update session and so if update session is being used we do not create a new react agent and invoke the same old one with new tools.



[Nest] 63031  - 06/14/2025, 5:19:13 PM   ERROR [Session] No active page found (at IrisBrowser.getActivePage (webpack://agent-infra/browser/src/base-browser.ts:249:11))
Error: No active page found
    at IrisBrowser.getActivePage (webpack://agent-infra/browser/src/base-browser.ts:249:11)
    at async IrisBrowserOperator.getActivePage (/Users/shanurrahman/Documents/spc/qwen/zenobia/src/packages/ui-tars/operators/browser-operator/src/browser-operator.ts:82:18)

catch this error manually and create a new page


[x] the user_call is not being handled on both sides, we are also not showing what events are being triggered
[x] update session forgot about the past message and conversation history
[x] not double clicking on the app on the app screen
[x] Update session is not working
[x] scroll too fast


Final answer shows up in Running Tasks, possibly messed up the events that are being emitted from the backend.
[x] Always keep the right tab open! better that way
[x] check ui tars operator


when summarization occurs, only summarize the steps taken by the agent, not the users questions, users questions should be left intact. Also user's initial questions are being returned as is. this step should be deleted

Also, the frontend doesn't subscribe to the first question being sent from chatbot
gui agent seems to not be sending all updates back to the main agent, the copy paste example fails because main agent keeps trying to copy
explicitly tell the agent to use duckduckgo for search engine


We have this issue where the main agent starts to tell key combos to guiAgent, 
Executed tool: guiAgent with {"command":"Press Ctrl+W to close the current tab"}

This should not happen

The job of the main agent is to declare the intent (What to do, not how to do it)
Task completion should end with a definitive response to the user, i.e we must call StatusEnum.END


Awaiting user clarification doesn't mention what is it that the agent wants.
Scrolls sometimes, and scrolls too much, but doesn't make the decision itself, if blank screen it should scroll up and so on


Readme prompt should also have the image
gui agent types 2 instead of @ when working in linux, is it failing to identify the os ? there was an issue we had earlier where it cannot use os.platform






[Nest] 341 - 06/21/2025, 6:45:20 PM DEBUG [Session] Emitting sessionStatus event: {"sessionId":"1750531509041","message":"What specific task would you like help with? I see a terminal or desktop screen, but I need more information about your goal. Could you please provide more details about what you'd like me to do?","status":"call_user"}



call user currently just gets killed and then the process continues




xfconf-query -c xsettings -p /Gdk/WindowScalingFactor -s 2
xfconf-query -c xfwm4 -p /general/theme -s Default-xhdpi


COPY docker/desktop-shortcuts/ /tmp/desktop-shortcuts/
RUN mkdir -p /config/Desktop && \
    cp /tmp/desktop-shortcuts/*.desktop /config/Desktop/ && \
    chmod +x /config/Desktop/*.desktop && \
    chown -R abc:abc /config/Desktop



## First thing, ask the agent to fix scaling issue of your laptop, add this as an example, since we are saving config in volume mount, this will be applied. The agent now needs to know that it is using ubuntu xfce, but still better to fix the scaling because it might not be able to 
click