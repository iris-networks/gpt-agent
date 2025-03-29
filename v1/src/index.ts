import { Elysia } from "elysia";
import { agentEndpoint } from "./agent";

// Create the main server
const app = new Elysia()
  // Mount our agent endpoint WebSocket server
  .use(agentEndpoint)
  // Add a simple health check route
  .get("/", () => "Zenobia Agent Server is running");

// Start the server
app.listen(8080, () => {
  console.log(`🚀 Zenobia Agent Server is running at ${app.server?.hostname}:${app.server?.port}`);
  console.log(`WebSocket endpoint available at ws://localhost:8080/agent`);
});