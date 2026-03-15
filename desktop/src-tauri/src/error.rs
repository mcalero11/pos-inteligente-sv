use serde::Serialize;

#[derive(Debug, thiserror::Error, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum AppError {
    #[error("{0}")]
    Auth(String),

    #[error("{0}")]
    Database(String),

    #[error("{0}")]
    System(String),

    #[error("{0}")]
    Dte(String),

    #[error("{0}")]
    TaskJoin(String),
}

impl From<String> for AppError {
    fn from(s: String) -> Self {
        AppError::System(s)
    }
}
