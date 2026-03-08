# Metadata Creator

[中文版](README.md)

A metadata management tool for organizing and managing tag categories.

## Features

- Tag Category Management: Create, edit, and delete custom tag categories
- Category System: Organize tags into categories with flexible mapping
- Import/Export: Support for importing and exporting tag categories and projects
- Local Storage: Tag categories are saved locally in the application directory
- Template System: Example folder for storing template files

## Installation

1. Download the latest release from the releases page
2. Extract the archive to your desired location
3. Run `Metadata Creator.exe`

## Usage

### Tag Category Management

- Click "Add New Tag Category" to create a new tag category
- Use "Import Tag Category" to import tag categories from JSON files
- Export individual tag categories using the "Export" button

### Category Management

- Add new categories using the "Add Category" button
- Select a Tag Category for each category
- Use "Import all" to import all tags from the selected Tag Category
- Add individual tags manually or through drag-and-drop

### File Operations

- Open: Load project files from the Example folder or other locations
- Save: Export the entire project including all tag categories and categories

## File Structure

```
Metadata Creator/
├── Categories/              # Tag Category storage
├── Example/                 # Template files
└── Metadata Creator.exe     # Application
```

## Configuration

Tag categories are automatically saved to the `Categories` folder in the application directory. Each tag category is stored as a separate JSON file.

## License

MIT License

## Author

Mis Fortune
