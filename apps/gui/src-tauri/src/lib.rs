use tauri::{Emitter, Manager};

use std::process::Command;

#[tauri::command]
async fn jj_git_clone(url: String, path: String) -> Result<String, String> {
    let output = Command::new("jj")
        .arg("git")
        .arg("clone")
        .arg(&url)
        .arg(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Successfully cloned {} to {}", url, path))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn jj_init_repo(path: String) -> Result<String, String> {
    let output = Command::new("jj")
        .arg("git")
        .arg("init")
        .arg("--colocated")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Successfully initialized jj repo at {}", path))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn check_path_exists(path: String) -> bool {
    std::path::Path::new(&path).exists()
}

#[tauri::command]
fn is_jj_repo(path: String) -> bool {
    std::path::Path::new(&path).join(".jj").exists()
}

#[tauri::command]
async fn get_repo_remote_urls(path: String) -> Result<Vec<String>, String> {
    let output = Command::new("jj")
        .arg("git")
        .arg("remote")
        .arg("list")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let urls = stdout
            .lines()
            .filter_map(|line| {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    Some(parts[1].to_string())
                } else {
                    None
                }
            })
            .collect();
        Ok(urls)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
            if let Some(url) = args.iter().find(|arg| arg.starts_with("jujutsu://")) {
                let _ = app.emit("deep-link", url);
            }
        }))
        .invoke_handler(tauri::generate_handler![
            jj_git_clone,
            jj_init_repo,
            check_path_exists,
            is_jj_repo,
            get_repo_remote_urls
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
