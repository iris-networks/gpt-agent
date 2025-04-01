import { z } from "zod";

export const NextToolInput = z.object({
  userIntent: z.string().describe("The user's goal or intent for the interaction"),
  previousActions: z.array(z.string()).optional().describe("List of previous actions taken in the workflow"),
});