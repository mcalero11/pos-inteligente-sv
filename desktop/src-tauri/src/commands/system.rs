use chrono;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

/// Open the application log folder in the system file explorer
#[tauri::command]
pub async fn open_log_folder(app_handle: AppHandle) -> Result<(), String> {
    log::info!("Opening log folder");

    // Use the system log directory where Tauri plugin writes logs
    let logs_dir = app_handle
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get app log dir: {}", e))?;

    // Always create logs directory if it doesn't exist
    std::fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("Failed to create logs directory: {}", e))?;

    log::debug!("Opening logs directory: {:?}", logs_dir);

    // Convert path to string for the shell command
    let logs_dir_str = logs_dir
        .to_str()
        .ok_or_else(|| "Invalid logs directory path".to_string())?;

    // Use shell plugin to open the folder with the appropriate command for each OS
    let shell = app_handle.shell();

    #[cfg(target_os = "macos")]
    {
        shell
            .command("open")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        shell
            .command("explorer")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        shell
            .command("xdg-open")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    log::info!("Log folder opened successfully");

    // Check if log files exist and list them
    if let Ok(entries) = std::fs::read_dir(&logs_dir) {
        let log_files: Vec<String> = entries
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                let file_name = entry.file_name().to_string_lossy().to_lowercase();
                file_name.ends_with(".log")
            })
            .map(|entry| entry.file_name().to_string_lossy().to_string())
            .collect();

        if log_files.is_empty() {
            log::info!("No log files found in directory: {:?}", logs_dir);
        } else {
            log::info!("Found log files: {:?}", log_files);

            // Show the size of the main log files
            for log_file in &log_files {
                let log_path = logs_dir.join(log_file);
                if let Ok(metadata) = std::fs::metadata(&log_path) {
                    log::info!("Log file '{}' size: {} bytes", log_file, metadata.len());
                }
            }
        }
    } else {
        log::error!("Failed to read logs directory: {:?}", logs_dir);
    }

    Ok(())
}

/// Generate test logs for debugging purposes
#[tauri::command]
pub async fn generate_test_logs(app_handle: AppHandle) -> Result<(), String> {
    log::info!("Generating test logs for debugging purposes");

    // Use the same system log directory where Tauri plugin writes logs
    let logs_dir = app_handle
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get app log dir: {}", e))?;

    // Always create logs directory if it doesn't exist
    std::fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("Failed to create logs directory: {}", e))?;

    // Generate various log levels
    log::trace!("Test TRACE level log from generate_test_logs command");
    log::debug!("Test DEBUG level log from generate_test_logs command");
    log::info!("Test INFO level log from generate_test_logs command");
    log::warn!("Test WARNING level log from generate_test_logs command");
    log::error!("Test ERROR level log from generate_test_logs command");

    // Generate logs with structured data
    log::info!("Test log with structured data: user_id=12345, action=test_generation");

    // Generate performance logs
    log::info!("Performance test: operation_duration=150ms, memory_usage=45MB");

    // Generate batch logs
    for i in 1..=5 {
        log::info!("Batch test log entry {} of 5", i);
    }

    // Write a manual test file to the universal logs directory
    let test_log_path = logs_dir.join("manual-test.log");
    let test_content = format!(
        "Manual test log created at: {}\nTest logs generated successfully via generate_test_logs command\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S")
    );

    std::fs::write(&test_log_path, test_content)
        .map_err(|e| format!("Failed to create manual test log: {}", e))?;

    log::info!("Test logs generation completed successfully");
    log::info!("Manual test log file created: {:?}", test_log_path);

    Ok(())
}
