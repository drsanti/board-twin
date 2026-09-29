//! board-twin desktop shell — starts the embedded broker, then opens
//! the native window loading the React UI.
//!
//! The UI talks to the broker over the same WS/JSON API (:7392) that
//! external web apps use — the shell dogfoods the public contract.

fn main() {
    std::thread::spawn(boardtwin_broker::run);

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running board-twin");
}
