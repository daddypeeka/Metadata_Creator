// File Operations - Import/Export functionality

// Handle Export Tag Category
async function handleExportTagCategory(tagCategoryKey) {
    try {
        const { invoke } = window.__TAURI__.core;
        
        const tagCategory = tagCategories[tagCategoryKey];
        if (!tagCategory) {
            alert('Tag category not found!');
            return;
        }
        
        const data = {
            name: tagCategory.name,
            tags: tagCategory.tags
        };
        
        const filePath = await window.__TAURI__.dialog.save({
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }],
            defaultPath: `${tagCategory.name.toLowerCase().replace(/\s+/g, '_')}.json`
        });
        
        if (!filePath) return;
        
        await invoke('export_metadata', { data, filePath });
        alert('Tag category exported successfully!');
    } catch (error) {
        alert(`Export failed: ${error}`);
    }
}

// Handle Import Tag Category
async function handleImportTagCategory() {
    try {
        const { invoke } = window.__TAURI__.core;
        
        const selected = await window.__TAURI__.dialog.open({
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        });
        
        if (!selected) return;
        
        const data = await invoke('import_metadata', { filePath: selected });
        const key = data.name.toLowerCase().replace(/\s+/g, '_');
        
        // Check if UI already exists
        const existingUI = document.querySelector(`.tag-category[data-tag-category-key="${key}"]`);
        if (existingUI) {
            alert('Tag category already exists!');
            return;
        }
        
        // Add to data structure
        tagCategories[key] = {
            name: data.name,
            tags: data.tags || []
        };
        
        // Create UI
        createTagCategoryUIElement(key, data.name);
        updateAllTagCategorySelectors();
        
        // Save to local storage
        await saveTagCategoryToLocal(key);
        
        alert('Tag category imported successfully!');
    } catch (error) {
        alert(`Import failed: ${error}`);
    }
}

// Handle Open
async function handleOpen() {
    try {
        const { invoke } = window.__TAURI__.core;
        
        // Get Example directory for default path
        const exampleDir = await invoke('get_example_dir');
        
        const selected = await window.__TAURI__.dialog.open({
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }],
            defaultPath: exampleDir
        });
        
        if (!selected) return;
        
        const data = await invoke('import_metadata', { filePath: selected });
        
        // Clear existing data
        categorySection.innerHTML = '';
        tagCategorySection.innerHTML = '';
        categoryCount = 0;
        
        // Clear custom tag categories (keep defaults)
        Object.keys(tagCategories).forEach(key => {
            if (key !== 'genre' && key !== 'language') {
                delete tagCategories[key];
            }
        });
        
        // Import tag categories
        if (data.tagCategories) {
            data.tagCategories.forEach(tc => {
                if (tc.key !== 'genre' && tc.key !== 'language') {
                    tagCategories[tc.key] = {
                        name: tc.name,
                        tags: tc.tags
                    };
                }
            });
        }
        
        // Rebuild UI
        rebuildTagCategorySection();
        initTagCategoryUI();
        
        // Import categories
        if (data.categories) {
            data.categories.forEach(cat => {
                const categoryId = addCategory(cat.name, cat.tag_category);
                cat.tags.forEach(tagName => {
                    addTagToCategory(tagName, categoryId, cat.tag_category);
                });
            });
        }
        
        updateOutput();
        alert('Project opened successfully!');
    } catch (error) {
        alert(`Open failed: ${error}`);
    }
}

// Handle Save (Export entire project)
async function handleSave() {
    try {
        const { invoke } = window.__TAURI__.core;
        
        // Collect tag categories (excluding defaults)
        const tagCategoriesData = [];
        Object.entries(tagCategories).forEach(([key, tc]) => {
            if (key !== 'genre' && key !== 'language') {
                tagCategoriesData.push({
                    key: key,
                    name: tc.name,
                    tags: tc.tags
                });
            }
        });
        
        // Collect categories
        const categoriesData = [];
        document.querySelectorAll('.category').forEach(category => {
            const categoryName = category.querySelector('.category-name-input').value;
            const tagCategory = category.querySelector('.tag-category-select').value || null;
            const tags = Array.from(category.querySelectorAll('.category-tags .tag'))
                .map(tag => tag.textContent.replace('×', '').trim());
            
            categoriesData.push({
                name: categoryName,
                tag_category: tagCategory,
                tags: tags
            });
        });
        
        const data = {
            tagCategories: tagCategoriesData,
            categories: categoriesData
        };
        
        const filePath = await window.__TAURI__.dialog.save({
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }],
            defaultPath: 'project.json'
        });
        
        if (!filePath) return;
        
        await invoke('export_metadata', { data, filePath });
        alert('Project saved successfully!');
    } catch (error) {
        alert(`Save failed: ${error}`);
    }
}

// Rebuild tag category section with action buttons
function rebuildTagCategorySection() {
    tagCategorySection.innerHTML = '';
    
    const addActionsDiv = document.createElement('div');
    addActionsDiv.className = 'add-tag-category-actions';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-tag-category-btn';
    addBtn.id = 'addTagCategoryBtn';
    addBtn.textContent = 'Add New Tag Category';
    addBtn.addEventListener('click', () => addTagCategoryUI());
    
    const importBtn = document.createElement('button');
    importBtn.className = 'import-tag-category-btn';
    importBtn.id = 'importTagCategoryBtn';
    importBtn.textContent = 'Import Tag Category';
    importBtn.addEventListener('click', handleImportTagCategory);
    
    addActionsDiv.appendChild(addBtn);
    addActionsDiv.appendChild(importBtn);
    tagCategorySection.appendChild(addActionsDiv);
}
