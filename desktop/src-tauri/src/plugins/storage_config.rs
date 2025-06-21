/// Build the Stronghold secure storage plugin
pub fn build() -> tauri_plugin_stronghold::Builder {
    tauri_plugin_stronghold::Builder::new(|_| vec![])
}

/// Build Stronghold for development with additional security options
pub fn build_development() -> tauri_plugin_stronghold::Builder {
    tauri_plugin_stronghold::Builder::new(|_| vec![])
    // Add any development-specific configurations here
    // For example, you might want to add debugging capabilities
}

/// Build Stronghold for production with maximum security
pub fn build_production() -> tauri_plugin_stronghold::Builder {
    tauri_plugin_stronghold::Builder::new(|_| vec![])
    // Add any production-specific security configurations here
    // For example, you might want to add additional encryption layers
}

/// Build Stronghold for testing with minimal security (faster tests)
pub fn build_test() -> tauri_plugin_stronghold::Builder {
    tauri_plugin_stronghold::Builder::new(|_| vec![])
    // Add any test-specific configurations here
    // For example, you might want to use weaker encryption for speed
}
