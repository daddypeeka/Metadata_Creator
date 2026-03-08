use serde::{Deserialize, Serialize};
use serde_json;
use std::fs;
use std::path::Path;
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub name: String,
    pub tag_category: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TagCategory {
    pub key: String,
    pub name: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectData {
    pub tag_categories: Vec<TagCategory>,
    pub categories: Vec<Category>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetadataData {
    pub categories: Vec<Category>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn import_metadata(file_path: String) -> Result<serde_json::Value, String> {
    let path = Path::new(&file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    Ok(data)
}

#[tauri::command]
fn export_metadata(data: serde_json::Value, file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    
    let json_content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    fs::write(&path, json_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn get_tag_categories_dir() -> Result<String, String> {
    // Get the executable directory
    let exe_path = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let exe_dir = exe_path.parent()
        .ok_or("Failed to get executable directory".to_string())?;
    
    let categories_dir = exe_dir.join("Categories");
    
    // Create directory if it doesn't exist
    if !categories_dir.exists() {
        fs::create_dir_all(&categories_dir)
            .map_err(|e| format!("Failed to create Categories directory: {}", e))?;
    }
    
    Ok(categories_dir.to_str().unwrap().to_string())
}

#[tauri::command]
async fn get_example_dir() -> Result<String, String> {
    // Get executable directory
    let exe_path = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let exe_dir = exe_path.parent()
        .ok_or("Failed to get executable directory".to_string())?;
    
    let example_dir = exe_dir.join("Example");
    
    // Create directory if it doesn't exist
    if !example_dir.exists() {
        fs::create_dir_all(&example_dir)
            .map_err(|e| format!("Failed to create Example directory: {}", e))?;
    }
    
    Ok(example_dir.to_str().unwrap().to_string())
}

#[tauri::command]
async fn list_tag_categories() -> Result<Vec<serde_json::Value>, String> {
    let categories_dir = get_tag_categories_dir().await?;
    let categories_path = Path::new(&categories_dir);
    
    let mut tag_categories = Vec::new();
    
    for entry in fs::read_dir(categories_path)
        .map_err(|e| format!("Failed to read directory: {}", e))? {
        
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() && path.extension().unwrap_or_default() == "json" {
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            
            let data: serde_json::Value = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse JSON: {}", e))?;
            
            tag_categories.push(data);
        }
    }
    
    Ok(tag_categories)
}

#[tauri::command]
async fn save_tag_category(name: String, tags: Vec<String>) -> Result<(), String> {
    let categories_dir = get_tag_categories_dir().await?;
    let key = name.to_lowercase().replace(" ", "_");
    let file_path = Path::new(&categories_dir).join(format!("{}.json", key));
    
    let data = serde_json::json!({
        "name": name,
        "tags": tags
    });
    
    let json_content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    fs::write(&file_path, json_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn delete_tag_category(name: String) -> Result<(), String> {
    let categories_dir = get_tag_categories_dir().await?;
    let key = name.to_lowercase().replace(" ", "_");
    let file_path = Path::new(&categories_dir).join(format!("{}.json", key));
    
    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete file: {}", e))?;
    }
    
    Ok(())
}

// Initialize built-in resources on app startup
fn initialize_built_in_resources() -> Result<(), String> {
    // Get the executable directory
    let exe_path = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let exe_dir = exe_path.parent()
        .ok_or("Failed to get executable directory".to_string())?;
    
    // Get the resources directory (where bundled resources are located)
    let resources_dir = exe_dir.join("resources");
    
    // Initialize Categories directory
    let categories_dir = exe_dir.join("Categories");
    if !categories_dir.exists() {
        fs::create_dir_all(&categories_dir)
            .map_err(|e| format!("Failed to create Categories directory: {}", e))?;
    }
    
    // Copy built-in tag categories from resources
    let resources_categories = resources_dir.join("Categories");
    if resources_categories.exists() {
        for entry in fs::read_dir(&resources_categories)
            .map_err(|e| format!("Failed to read resources Categories: {}", e))? {
            
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let source_path = entry.path();
            
            if source_path.is_file() && source_path.extension().unwrap_or_default() == "json" {
                let file_name = source_path.file_name().unwrap();
                let target_path = categories_dir.join(file_name);
                
                // Only copy if file doesn't exist in target
                if !target_path.exists() {
                    fs::copy(&source_path, &target_path)
                        .map_err(|e| format!("Failed to copy file: {}", e))?;
                }
            }
        }
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize built-in resources before starting the app
    if let Err(e) = initialize_built_in_resources() {
        eprintln!("Warning: Failed to initialize built-in resources: {}", e);
    }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, import_metadata, export_metadata, get_tag_categories_dir, get_example_dir, list_tag_categories, save_tag_category, delete_tag_category])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
