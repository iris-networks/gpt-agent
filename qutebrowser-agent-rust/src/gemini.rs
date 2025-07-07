use crate::types::{
    BrowserPlan, GeminiContent, GeminiGenerationConfig, GeminiPart, GeminiRequest,
    GeminiResponse,
};
use anyhow::{anyhow, Context, Result};
use reqwest::Client;
use serde_json::json;
use std::env;

pub struct GeminiClient {
    client: Client,
    api_key: String,
    base_url: String,
}

impl GeminiClient {
    pub fn new() -> Result<Self> {
        let api_key = env::var("GEMINI_API_KEY")
            .context("GEMINI_API_KEY environment variable not set")?;

        Ok(Self {
            client: Client::new(),
            api_key,
            base_url: "https://generativelanguage.googleapis.com/v1beta/models".to_string(),
        })
    }

    pub async fn get_browser_plan(&self, conversation: Vec<GeminiContent>) -> Result<BrowserPlan> {
        let schema = json!({
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["execute", "finish"],
                    "description": "'execute' to run the steps and continue, 'finish' to end the task."
                },
                "thought": {
                    "type": "string",
                    "description": "Your reasoning for the plan. For the 'finish' action, this will be used as the final summary."
                },
                "wittyMessage": {
                    "type": "string",
                    "description": "A short, funny, and cryptic message to display to the user that obscures what you are actually doing. Be creative and humorous but keep it brief. Use emojis."
                },
                "steps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "command": {
                                "type": "string",
                                "description": "A single qutebrowser command. MUST start with a colon ':'."
                            }
                        },
                        "required": ["command"]
                    },
                    "description": "A sequence of qutebrowser commands to execute in order. Include this array when action is 'execute', omit when action is 'finish'."
                }
            },
            "required": ["action", "thought", "wittyMessage"]
        });

// Use `const` for a compile-time constant string.
// The `indoc!` macro allows the string to be indented with the surrounding code.
const SYSTEM_PROMPT: &str = r#"
    You are an expert qutebrowser automation agent. Your goal is to complete the user's task by interacting with a web browser.

    **About qutebrowser:**
    qutebrowser is a keyboard-focused web browser with a minimalist GUI. You interact with it not by clicking, but by issuing commands, much like a command-line interface. Your primary tools are commands to navigate, get 'hints' to identify clickable elements, and then 'follow' those hints. **Hints will always be numerical.**

    **Your Operating Loop:**
    1.  **Analyze the current state** (based on the user's request and the latest screenshot).
    2.  **Formulate a plan** which consists of a 'thought' and a sequence of 'steps' (commands).
    3.  **Output the plan** as a single JSON object.

    Your plan will be executed, a new screenshot will be taken, and then you will start the loop again.

    **JSON Output Format:**
    You MUST respond with a JSON object with the following structure.
    ```json
    {
      "action": "ACTION_NAME",
      "thought": "Your detailed reasoning for the sequence of steps you are about to take. If finishing, this is your final summary.",
      "wittyMessage": "A short, funny, and cryptic message that will be displayed to the user to obscure what you are actually doing. Be creative and humorous but keep it brief. Use emojis.",
      "steps": [
        { "command": ":command_1" },
        { "command": ":command_2" },
        ...
      ]
    }
    ```
    - `action`: (Required) Must be one of `execute` or `finish`.
    - `thought`: (Required) Your reasoning. For the `finish` action, this will be your final summary.
    - `wittyMessage`: (Required) A brief, funny message shown to the user that hides your actual actions. Examples: "🔮 Consulting the digital oracle...", "🎭 Performing internet magic tricks...", "🕵️ Sneaking through the web like a digital ninja..."
    - `steps`: (Conditional) **Required** when `action` is `execute`. It's an array of command objects.

    **Command Chaining Strategy:**
    You should chain commands when you can confidently predict the outcome. For example, after activating an input field, you know you can immediately type into it and press enter.

    **Advanced Hinting for Cluttered Screens:**
    When a page is very cluttered (e.g., a calendar), hint numbers can obscure the text. In these cases, you can use a powerful filtering technique:
    1.  First, issue the `:hint` command to display all hints.
    2.  Instead of following with `:hint-follow`, use the `:xdotool-type` command to type the first few letters of the text on the element you want to click.
    3.  qutebrowser will filter the hints in real-time. If your text uniquely identifies an element, qutebrowser will "click" it automatically. If not, the hints will be filtered, and you can then use `:hint-follow` on the smaller set of visible hints in the next step.


    **EXAMPLE of a single turn for "Search Google for 'AI SDK' and click the first result":**
    *(This example demonstrates the basic hint-based workflow.)*

    *Initial State: Blank page.*
    1.  **Your JSON output:**
        ```json
        {
          "action": "execute",
          "thought": "First, I need to open Google and then get the hint labels to find the search bar.",
          "wittyMessage": "🌐 Summoning the mighty Google spirits...",
          "steps": [
            { "command": ":open https://google.com" },
            { "command": ":hint" }
          ]
        }
        ```
    *(State after execution: Screenshot shows Google with hint '15' on the search bar.)*
    2.  **Your JSON output:**
        ```json
        {
          "action": "execute",
          "thought": "The search bar has the hint '15'. I will follow that hint, type my search query, and press Enter to submit.",
          "wittyMessage": "🎯 Whispering secrets to the search box...",
          "steps": [
            { "command": ":hint-follow 15" },
            { "command": ":insert-text AI SDK" },
            { "command": ":fake-key <Return>" }
          ]
        }
        ```
    *(...and so on, until the task is finished.)*


    **Available Commands (for the 'command' field):**

    **Navigation:**
    - `:open URL`: Navigate to a specific webpage.
    - `:back`, `:forward`, `:reload`

    **Page Interaction:**
    - `:hint`: Display **numerical** labels on all clickable elements. ALWAYS take a screenshot after to see the labels.
    - `:hint links`: Display **numerical** hints only for links.
    - `:hint-follow NUMBER`: Click element with the specified numerical label.
    - `:insert-text TEXT`: Insert text at the cursor.
    - `:fake-key <Return|Escape|Tab>`: Press Enter, Escape, or Tab.
    - `:xdotool-type TEXT`: (External tool) Type characters. Primarily used after `:hint` to filter elements by their text.

    **Scrolling & Search:**
    - `:scroll-to-perc PERCENT`: Scroll to a percentage of the page (0-100).
    - `:scroll-page 0 1`: Scroll one page down.
    - `:search TEXT`: Search for text on the current page.


    **CRITICAL RULES:**
    1.  All commands MUST start with a colon `:`.
    2.  After a plan involving `:hint` is executed, the next screenshot will show the **numerical hint labels**. Use these numbers in your next plan.
    3.  You can only see the screen via the screenshots provided. You are blind otherwise.
    4.  Your final output MUST be an `action: "finish"` object. Your `thought` for this action is the final summary.

    Also ignore the browser error at the bottom that shows up in red, wait for 2 seconds for it to disappear and check if the cursor is already in the correct position
    Now, begin the task.
"#;

        // Add system prompt to conversation
        let mut contents_with_system = vec![GeminiContent {
            role: "user".to_string(),
            parts: vec![GeminiPart {
                text: Some(SYSTEM_PROMPT.to_string()),
                inline_data: None,
            }],
        }];
        contents_with_system.extend(conversation);

        let request = GeminiRequest {
            contents: contents_with_system,
            generation_config: GeminiGenerationConfig {
                response_mime_type: "application/json".to_string(),
                response_schema: Some(schema),
            },
        };

        // Debug: Log the request we're sending

        let url = format!(
            "{}/gemini-2.5-flash:generateContent?key={}",
            self.base_url, self.api_key
        );

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to send request to Gemini API")?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            println!("❌ Gemini API Error ({}): {}", status, error_text);
            return Err(anyhow!("Gemini API error ({}): {}", status, error_text));
        }

        let gemini_response: GeminiResponse = response
            .json()
            .await
            .context("Failed to parse Gemini response")?;

        if gemini_response.candidates.is_empty() {
            return Err(anyhow!("No candidates in Gemini response"));
        }

        let content = &gemini_response.candidates[0].content;
        if content.parts.is_empty() {
            return Err(anyhow!("No parts in Gemini response"));
        }

        let text = content.parts[0]
            .text
            .as_ref()
            .ok_or_else(|| anyhow!("No text in Gemini response"))?;

        // Debug: Log the raw response from Gemini

        // Try to extract JSON from the response (in case it's wrapped in markdown)
        let json_text = if text.trim().starts_with("```json") {
            // Extract JSON from markdown code block
            text.lines()
                .skip(1) // Skip the ```json line
                .take_while(|line| !line.trim().starts_with("```"))
                .collect::<Vec<_>>()
                .join("\n")
        } else if text.trim().starts_with("```") {
            // Extract from generic code block
            text.lines()
                .skip(1)
                .take_while(|line| !line.trim().starts_with("```"))
                .collect::<Vec<_>>()
                .join("\n")
        } else {
            text.to_string()
        };


        let plan: BrowserPlan = serde_json::from_str(&json_text)
            .context(format!("Failed to parse browser plan from Gemini response. Raw response: {}\nCleaned JSON: {}", text, json_text))?;

        // Validate that steps are present when action is execute
        if plan.action == "execute" && (plan.steps.is_none() || plan.steps.as_ref().unwrap().is_empty()) {
            return Err(anyhow!(
                "Steps are required and must not be empty when action is 'execute', but none were provided"
            ));
        }

        Ok(plan)
    }
}