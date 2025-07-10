**Write me another AI agent like the one you wrote for qutebrowser agent(this is a replacement for qutebrowseragent that uses puppeteer to control a chrome instance) that** automates web tasks using Puppeteer. The agent should:
 1. Take a user instruction (e.g., "compose an email on Gmail").
 2. Launch or connect to a Puppeteer browser instance and navigate to the target page.
 3. Take a screenshot of the page and analyze it (optional: use OCR or vision models to detect visible text like "Send", "To", etc.).
 4. Dump the full HTML of the page, clean it by removing unnecessary JavaScript, ads, event handlers, and irrelevant elements.
 5. Use the cleaned HTML + screenshot hints to plan a multi-step automation script (e.g., "click Compose", "fill To", "fill Subject", "click Send").
 6. The script should be executable by Puppeteer and robust across reloads or retries.
 7. It must support interacting with:
    * **Shadow DOMs**: Traverse and access shadow roots to find nested elements.
    * **iFrames**: Detect iframes, switch context to them, and interact with elements inside.
    * **Nested Shadow DOMs or Shadow DOMs inside iFrames**, if necessary.
 8. Allow reuse of browser and page instances across steps for stateful workflows.
 9. Report back success or failure after each step, and allow the agent to replan if an action fails.

 Also include helper utilities for:
 * Extracting and interacting with elements inside shadow DOMs.
 * Selecting and interacting with iFrames by selector, name, or URL match.
 * Waiting for visible or interactable elements before clicking or typing.

Avoid relying solely on static selectors—support both semantic selectors and fallback heuristics using OCR or visible text if needed.