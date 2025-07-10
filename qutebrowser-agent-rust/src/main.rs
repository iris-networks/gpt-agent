use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use tracing::{info, error};
use anyhow::Result;
use base64::Engine;

mod types;
mod gemini;
mod qutebrowser;

use types::*;
use gemini::GeminiClient;
use qutebrowser::QutebrowserManager;

type AppState = Arc<RwLock<HashMap<String, Session>>>;

const MAX_STEPS: usize = 10;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt::init();
    
    let state = Arc::new(RwLock::new(HashMap::<String, Session>::new()));
    
    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            create_session,
            send_message,
            upload_image,
            stop_session
        ])
        .setup(|app| {
            info!("🚀 Iris Free Trial Desktop App starting up");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}

#[tauri::command]
async fn create_session(state: tauri::State<'_, AppState>) -> Result<CreateSessionResponse, String> {
    let session_id = Uuid::new_v4().to_string();
    let session = Session::new(session_id.clone());
    
    state.write().await.insert(session_id.clone(), session);
    
    Ok(CreateSessionResponse { session_id })
}

#[tauri::command]
async fn send_message(
    session_id: String,
    request: SendMessageRequest,
    state: tauri::State<'_, AppState>,
) -> Result<SendMessageResponse, String> {
    let mut sessions = state.write().await;
    let session = match sessions.get_mut(&session_id) {
        Some(session) => session,
        None => {
            return Err("Session not found".to_string());
        }
    };

    // Add user message to conversation
    session.add_user_message(request.message.clone());

    // Process with browser agent
    match process_browser_instruction(&request.message, &mut *session).await {
        Ok(response) => {
            session.add_assistant_message(response.clone());
            Ok(SendMessageResponse { response })
        }
        Err(e) => {
            error!("❌ Error processing instruction: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn upload_image(
    session_id: String,
    image_data: Vec<u8>,
    state: tauri::State<'_, AppState>,
) -> Result<UploadImageResponse, String> {
    let mut sessions = state.write().await;
    let session = match sessions.get_mut(&session_id) {
        Some(session) => session,
        None => {
            return Err("Session not found".to_string());
        }
    };

    // Convert to base64
    let base64_image = base64::engine::general_purpose::STANDARD.encode(&image_data);
    
    // Add to session
    session.add_image(base64_image);
    
    Ok(UploadImageResponse {
        message: "Image uploaded successfully".to_string(),
    })
}

#[tauri::command]
async fn stop_session(
    session_id: String,
    state: tauri::State<'_, AppState>,
) -> Result<StopSessionResponse, String> {
    let mut sessions = state.write().await;
    
    match sessions.remove(&session_id) {
        Some(_) => {
            Ok(StopSessionResponse {
                message: "Session stopped successfully".to_string(),
            })
        }
        None => {
            Err("Session not found".to_string())
        }
    }
}

async fn process_browser_instruction(instruction: &str, session: &mut Session) -> Result<String> {
    let gemini_client = GeminiClient::new()?;
    let qutebrowser = QutebrowserManager::new();
    
    // Take initial screenshot
    let screenshot = qutebrowser.take_screenshot().await?;
    session.add_image(screenshot);
    
    for _step in 1..=MAX_STEPS {
        let conversation = session.build_gemini_conversation(instruction);
        let plan = gemini_client.get_browser_plan(conversation).await?;
        
        info!("🤖 AI Plan: {}", plan.thought);
        info!("✨ Witty message: {}", plan.witty_message);

        if plan.action == "finish" {
            println!("🎯 Final Response: {}", plan.thought);
            return Ok(plan.thought);
        }

        // Execute the planned steps
        if let Some(steps) = plan.steps {
            for command in steps {
                    println!("⚡ Executing: {}", command.command);
                    qutebrowser.execute_command(&command.command).await?;
                
                // Wait based on command type (minimum 500ms)
                let delay = if command.command.starts_with(":open") || 
                              command.command.starts_with(":back") || 
                              command.command.starts_with(":reload") {
                    3000
                } else {
                    1000
                };
                
                tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
            }
        }

        // Add executed plan to conversation
        session.add_assistant_message(format!("Executed plan: {}", plan.thought));
        
        // Take screenshot after execution
        let screenshot = qutebrowser.take_screenshot().await?;
        session.add_image(screenshot);
    }
    
    Ok("Maximum steps reached. Task may be incomplete.".to_string())
}