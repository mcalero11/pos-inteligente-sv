use tauri_plugin_log::{Builder, Target, TargetKind};

/// Build the logging plugin with human-readable formatting
pub fn build() -> Builder {
    Builder::new()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir {
                file_name: Some("pos-app".to_string()),
            }),
            Target::new(TargetKind::Webview),
        ])
        .level(log::LevelFilter::Debug)
        .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
        .max_file_size(50_000_000) // 50MB max file size
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{}] [{}] [{}:{}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                record.line().unwrap_or(0),
                message
            ))
        })
}
