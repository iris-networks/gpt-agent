import { z } from "zod";

export const NextToolInput = z.object({
  userIntent: z.string().describe("Action to take."),
  previousActions: z.string().describe("List of previous actions taken in the workflow,  including the last coordinates if clicked in the previous action"),
});