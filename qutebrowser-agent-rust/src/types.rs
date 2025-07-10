use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub messages: Vec<Message>,
    pub images: Vec<String>, // Base64 encoded images
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String, // "user" or "assistant"
    pub content: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiContent {
    pub role: String,
    pub parts: Vec<GeminiPart>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiPart {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "inlineData")]
    pub inline_data: Option<GeminiInlineData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiInlineData {
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiRequest {
    pub contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    pub generation_config: GeminiGenerationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiGenerationConfig {
    #[serde(rename = "responseMimeType")]
    pub response_mime_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "responseSchema")]
    pub response_schema: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiResponse {
    pub candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiCandidate {
    pub content: GeminiContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserPlan {
    pub action: String, // "execute" or "finish"
    pub thought: String,
    #[serde(rename = "wittyMessage")]
    pub witty_message: String,
    pub steps: Option<Vec<BrowserCommand>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserCommand {
    pub command: String,
}

// API Request/Response types
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSessionResponse {
    pub session_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendMessageRequest {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendMessageResponse {
    pub response: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadImageResponse {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StopSessionResponse {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl Session {
    pub fn new(id: String) -> Self {
        Self {
            id,
            messages: Vec::new(),
            images: Vec::new(),
        }
    }

    pub fn add_user_message(&mut self, content: String) {
        self.messages.push(Message {
            role: "user".to_string(),
            content,
            timestamp: chrono::Utc::now(),
        });
    }

    pub fn add_assistant_message(&mut self, content: String) {
        self.messages.push(Message {
            role: "assistant".to_string(),
            content,
            timestamp: chrono::Utc::now(),
        });
    }

    pub fn add_image(&mut self, base64_image: String) {
        self.images.push(base64_image);
    }

    pub fn build_gemini_conversation(&self, instruction: &str) -> Vec<GeminiContent> {
        let mut contents = Vec::new();

        // Add initial instruction with latest screenshot if available
        let mut parts = vec![GeminiPart {
            text: Some(instruction.to_string()),
            inline_data: None,
        }];

        if let Some(latest_image) = self.images.last() {
            parts.insert(0, GeminiPart {
                text: None,
                inline_data: Some(GeminiInlineData {
                    mime_type: "image/png".to_string(),
                    data: latest_image.clone(),
                }),
            });
        }

        contents.push(GeminiContent {
            role: "user".to_string(),
            parts,
        });

        // Add conversation history (simplified for now)
        for message in &self.messages {
            if message.role == "assistant" {
                contents.push(GeminiContent {
                    role: "model".to_string(),
                    parts: vec![GeminiPart {
                        text: Some(message.content.clone()),
                        inline_data: None,
                    }],
                });
            }
        }

        contents
    }
}

impl ErrorResponse {
    pub fn new(error: &str) -> Self {
        Self {
            error: error.to_string(),
        }
    }
}