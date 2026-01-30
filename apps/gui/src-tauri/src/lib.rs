use tauri::{Emitter, Manager};

use std::process::Command;
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use notify::{Watcher, RecursiveMode, Config};
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct Operation {
    id: String,
    time: String,
    user: String,
    description: String,
}

pub struct WatcherState {
    watcher: Option<notify::RecommendedWatcher>,
    current_path: Option<String>,
}

pub struct AppState {
    watcher_state: Mutex<WatcherState>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ChangedFile {
    path: String,
    status: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ChangeSet {
    #[serde(rename = "changeId")]
    change_id: String,
    files: Vec<ChangedFile>,
}

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

#[tauri::command]
async fn jj_get_operation_log(path: String) -> Result<Vec<Operation>, String> {
    // Custom template to get ID, Time, User, and Description
    // We use a separator to parse multiple lines correctly
    let output = Command::new("jj")
        .arg("op")
        .arg("log")
        .arg("--no-graph")
        .arg("--template")
        .arg("id ++ \"\\n\" ++ time.start().format(\"%Y-%m-%d %H:%M:%S\") ++ \"\\n\" ++ user ++ \"\\n\" ++ description ++ \"\\n@@@\"")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut operations = Vec::new();
    
    // Split by the custom separator
    for part in stdout.split("@@@") {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        let lines: Vec<&str> = part.lines().collect();
        if lines.len() >= 4 {
            operations.push(Operation {
                id: lines[0].trim().to_string(),
                time: lines[1].to_string(),
                user: lines[2].to_string(),
                description: lines[3..].join("\n"),
            });
        }
    }

    Ok(operations)
}

#[tauri::command]
async fn jj_restore_operation(path: String, id: String) -> Result<String, String> {
    let output = Command::new("jj")
        .arg("op")
        .arg("restore")
        .arg(&id)
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Successfully restored repository to operation {}", id))
    } else {
        match String::from_utf8(output.stderr) {
            Ok(err) => Err(err),
            Err(_) => Err("Failed to undo operation: Unknown error".to_string()),
        }
    }
}

#[tauri::command]
async fn get_jj_status(path: String) -> Result<ChangeSet, String> {
    // 1. Get current change ID
    let id_output = Command::new("jj")
        .arg("log")
        .arg("-r")
        .arg("@")
        .arg("-T")
        .arg("change_id")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    let change_id = if id_output.status.success() {
        String::from_utf8_lossy(&id_output.stdout).trim().to_string()
    } else {
        "unknown".to_string()
    };

    // 2. Get status
    let status_output = Command::new("jj")
        .arg("status")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if !status_output.status.success() {
        return Err(String::from_utf8_lossy(&status_output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&status_output.stdout);
    let mut files = Vec::new();
    let mut current_section = "";

    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        if line.starts_with("Working copy changes:") {
            current_section = "changes";
            continue;
        } else if line.starts_with("Conflicted files:") {
            current_section = "conflicts";
            continue;
        } else if line.ends_with(":") {
            current_section = "";
            continue;
        }

        if current_section == "changes" {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let status = match parts[0] {
                    "A" => "Added",
                    "M" => "Modified",
                    "D" => "Removed",
                    _ => "Modified",
                };
                files.push(ChangedFile {
                    path: parts[1..].join(" "),
                    status: status.to_string(),
                });
            }
        } else if current_section == "conflicts" {
            files.push(ChangedFile {
                path: line.to_string(),
                status: "Conflicted".to_string(),
            });
        }
    }

    Ok(ChangeSet {
        change_id,
        files,
    })
}

#[tauri::command]
async fn get_jj_diff(path: String, file_path: String) -> Result<String, String> {
    let output = Command::new("jj")
        .arg("diff")
        .arg("--git")
        .arg(&file_path)
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        match String::from_utf8(output.stderr) {
            Ok(err) => Err(err),
            Err(_) => Err("Failed to get diff: Unknown error".to_string()),
        }
    }
}

#[tauri::command]
async fn jj_get_log(path: String, revset: Option<String>) -> Result<Vec<Commit>, String> {
    let rev = revset.unwrap_or_else(|| "all()".to_string());
    
    // Complex template to output JSON-formatted string for each commit
    // Uses @@@ as a separator to parse the output reliably
    let template = r#""{ \"id\": \"" ++ commit_id ++ "\", \"changeId\": \"" ++ change_id ++ "\", \"author\": \"" ++ author.name() ++ "\", \"email\": \"" ++ author.email() ++ "\", \"date\": \"" ++ committer.timestamp().format("%Y-%m-%d %H:%M:%S") ++ "\", \"description\": \"" ++ description.first_line() ++ "\", \"isCurrent\": " ++ if(current_working_copy, "true", "false") ++ ", \"isImmutable\": " ++ if(immutable, "true", "false") ++ ", \"isConflicted\": " ++ if(conflict, "true", "false") ++ ", \"parentIds\": [" ++ parents.map(|p| "\"" ++ p.commit_id() ++ "\"").join(",") ++ "], \"bookmarks\": [" ++ bookmarks.map(|b| "\"" ++ b.name() ++ "\"").join(",") ++ "] }@@@""#;

    let output = Command::new("jj")
        .arg("log")
        .arg("-r")
        .arg(&rev)
        .arg("-T")
        .arg(template)
        .arg("--no-graph")
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut commits = Vec::new();

    for part in stdout.split("@@@") {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        // jj log with --no-graph might still have some markers at the beginning of the line
        // like @ or o. We need to skip them to find the starting {
        if let Some(start_index) = part.find('{') {
            let json_str = &part[start_index..];
            match serde_json::from_str::<Commit>(json_str) {
                Ok(commit) => commits.push(commit),
                Err(e) => {
                    // Log the error but continue parsing other commits
                    println!("Failed to parse commit JSON: {}. String: {}", e, json_str);
                }
            }
        }
    }

    Ok(commits)
}

#[tauri::command]
async fn watch_repo(
    path: String,
    handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let mut watcher_state = state.watcher_state.lock().map_err(|e| e.to_string())?;

    // If already watching this path, do nothing
    if let Some(ref current) = watcher_state.current_path {
        if current == &path {
            return Ok(());
        }
    }

    // Stop existing watcher if any
    watcher_state.watcher = None;
    watcher_state.current_path = None;

    let path_to_watch = path.clone();
    let (tx, rx) = std::sync::mpsc::channel();

    let mut watcher = notify::RecommendedWatcher::new(tx, Config::default())
        .map_err(|e| e.to_string())?;

    watcher.watch(Path::new(&path_to_watch), RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    watcher_state.watcher = Some(watcher);
    watcher_state.current_path = Some(path_to_watch.clone());

    // Spawn a thread to listen for events with debouncing
    std::thread::spawn(move || {
        let debounce_duration = std::time::Duration::from_millis(500);
        let mut last_emit: Option<std::time::Instant> = None;

        for res in rx {
            match res {
                Ok(event) => {
                    // Filter events: we only care about data changes
                    if event.kind.is_modify() || event.kind.is_create() || event.kind.is_remove() {
                        // Check if the event involves internal directories we should ignore
                        let should_ignore = event.paths.iter().any(|p| {
                            let s = p.to_string_lossy();
                            s.contains("/.jj") || s.contains("/.git") || s.contains("/node_modules") ||
                            s.ends_with(".jj") || s.ends_with(".git")
                        });

                        if !should_ignore {
                            let now = std::time::Instant::now();
                            if last_emit.is_none() || now.duration_since(last_emit.unwrap()) > debounce_duration {
                                println!("Repo changed: {:?}", event.paths);
                                let _ = handle.emit("repo-changed", ());
                                last_emit = Some(now);
                            }
                        }
                    }
                }
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn jj_undo(path: String) -> Result<String, String> {
    execute_jj_command(path, vec!["undo".to_string()])
}

#[tauri::command]
async fn jj_new(path: String) -> Result<String, String> {
    execute_jj_command(path, vec!["new".to_string()])
}

#[tauri::command]
async fn jj_absorb(path: String) -> Result<String, String> {
    execute_jj_command(path, vec!["absorb".to_string()])
}

#[tauri::command]
async fn jj_describe(path: String, message: Option<String>) -> Result<String, String> {
    let mut args = vec!["describe".to_string()];
    if let Some(m) = message {
        args.push("-m".to_string());
        args.push(m);
    }
    execute_jj_command(path, args)
}

fn execute_jj_command(path: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new("jj")
        .args(args)
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
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
            get_repo_remote_urls,
            jj_get_operation_log,
            jj_restore_operation,
            get_jj_status,
            get_jj_diff,
            jj_get_log,
            jj_undo,
            jj_new,
            jj_absorb,
            jj_describe,
            watch_repo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
