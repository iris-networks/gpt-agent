use anyhow::{anyhow, Context, Result};
use base64::Engine;
use std::process::Stdio;
use tokio::process::Command as TokioCommand;
use tracing::{info, warn, error};

pub struct QutebrowserManager {
    base_dir: String,
    is_macos: bool,
    is_containerized: bool,
}

impl QutebrowserManager {
    pub fn new() -> Self {
        let is_macos = cfg!(target_os = "macos");
        let is_containerized = std::env::var("IS_CONTAINERIZED").is_ok();
        
        let base_dir = if is_macos {
            // Use default qutebrowser config directory on macOS
            std::env::var("HOME")
                .map(|home| format!("{}/.config/qutebrowser", home))
                .unwrap_or_else(|_| "/Users/$(whoami)/.config/qutebrowser".to_string())
        } else {
            "/config/.config/qutebrowser".to_string()
        };

        Self {
            base_dir,
            is_macos,
            is_containerized,
        }
    }

    pub async fn is_running(&self) -> Result<bool> {
        let output = TokioCommand::new("pgrep")
            .arg("-f")
            .arg("qutebrowser")
            .output()
            .await
            .context("Failed to check if qutebrowser is running")?;

        Ok(output.status.success() && !output.stdout.is_empty())
    }

    pub async fn launch(&self) -> Result<()> {

        let mut cmd = TokioCommand::new("qutebrowser");
        
        if self.is_macos {
            // macOS configuration - minimal setup
        } else {
            // Linux configuration
            cmd.args(&["--basedir", &self.base_dir, "--untrusted-args"]);
            
            if self.is_containerized {
                cmd.env("DISPLAY", ":1");
                cmd.env("XDG_RUNTIME_DIR", "/tmp/runtime-root");
                cmd.current_dir("/config");
            } else {
                // Use system defaults for non-containerized Linux
                if let Ok(display) = std::env::var("DISPLAY") {
                    cmd.env("DISPLAY", display);
                }
            }
        }

        cmd.stdout(Stdio::null())
           .stderr(Stdio::null())
           .stdin(Stdio::null());

        let child = cmd.spawn().context("Failed to spawn qutebrowser process")?;

        // Don't wait for the process to finish
        tokio::spawn(async move {
            let _ = child.wait_with_output().await;
        });

        Ok(())
    }

    pub async fn execute_command(&self, command: &str) -> Result<()> {
        if !command.starts_with(':') {
            return Err(anyhow!("Command must start with ':' but got: {}", command));
        }

    
        // Execute qutebrowser command directly via terminal
        let result = TokioCommand::new("qutebrowser")
            .args(&[&format!(":{}", command.trim_start_matches(':'))])
            .output()
            .await;

        match result {
            Ok(output) => {
                if !output.status.success() {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    warn!("qutebrowser command failed: {}", stderr);
                }
            }
            Err(e) => {
                error!("Failed to execute qutebrowser command: {}", e);
            }
        }

        Ok(())
    }



    pub async fn take_screenshot(&self) -> Result<String> {

        if self.is_macos {
            self.take_screenshot_macos().await
        } else {
            self.take_screenshot_linux().await
        }
    }

    async fn take_screenshot_macos(&self) -> Result<String> {
        let temp_path = "/tmp/screenshot.png";
        
        // Use screencapture on macOS
        let output = TokioCommand::new("screencapture")
            .args(&["-x", temp_path]) // -x to disable sound
            .output()
            .await
            .context("Failed to take screenshot with screencapture")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("Screenshot failed: {}", stderr));
        }

        // Read the screenshot file and encode to base64
        let image_data = tokio::fs::read(temp_path)
            .await
            .context("Failed to read screenshot file")?;

        let base64_image = base64::prelude::BASE64_STANDARD.encode(&image_data);

        // Clean up the temporary file
        let _ = tokio::fs::remove_file(temp_path).await;

        Ok(base64_image)
    }

    async fn take_screenshot_linux(&self) -> Result<String> {
        let temp_path = "/tmp/screenshot.png";
        
        // Use scrot to take a screenshot
        let output = TokioCommand::new("scrot")
            .args(&["-z", temp_path])
            .output()
            .await
            .context("Failed to take screenshot with scrot")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("Screenshot failed: {}", stderr));
        }

        // Read the screenshot file and encode to base64
        let image_data = tokio::fs::read(temp_path)
            .await
            .context("Failed to read screenshot file")?;

        let base64_image = base64::prelude::BASE64_STANDARD.encode(&image_data);

        // Clean up the temporary file
        let _ = tokio::fs::remove_file(temp_path).await;

        Ok(base64_image)
    }

    pub async fn get_window_id(&self) -> Result<String> {
        let output = TokioCommand::new("xdotool")
            .args(&["search", "--name", "qutebrowser"])
            .output()
            .await
            .context("Failed to find qutebrowser window")?;

        if !output.status.success() {
            return Err(anyhow!("No qutebrowser window found"));
        }

        let window_id = String::from_utf8_lossy(&output.stdout)
            .lines()
            .next()
            .ok_or_else(|| anyhow!("No window ID found"))?
            .to_string();

        Ok(window_id)
    }

    pub async fn focus_window(&self) -> Result<()> {
        let window_id = self.get_window_id().await?;
        
        TokioCommand::new("xdotool")
            .args(&["windowfocus", &window_id])
            .output()
            .await
            .context("Failed to focus qutebrowser window")?;

        Ok(())
    }
}