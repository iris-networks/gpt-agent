import { Elysia } from 'elysia';
import { agentEndpoint } from './v1/src/agent';

// Create the main server that simply uses the agent endpoint
const app = new Elysia()
  // Mount our agent endpoint WebSocket server
  .use(agentEndpoint)
  // Add a simple health check route
  .get('/', () => 'Zenobia Agent Server is running')
  .listen(3000);

console.log(`🦊 Zenobia server is running at ${app.server?.hostname}:${app.server?.port}`);
console.log('WebSocket endpoint available at ws://localhost:3000/agent');