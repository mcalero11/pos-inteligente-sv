/// Build the Stronghold secure storage plugin
pub fn build() -> tauri_plugin_stronghold::Builder {
    tauri_plugin_stronghold::Builder::new(|_| vec![])
}
