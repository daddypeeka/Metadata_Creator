// Tag Category UI Management

// Initialize tag category UI for existing categories
async function initTagCategoryUI() {
    // Load local tag categories first
    await loadLocalTagCategories();
    
    for (const [key, category] of Object.entries(tagCategories)) {
        // Skip default Genre and Language tag categories
        if (key === 'genre' || key === 'language') {
            continue;
        }
        
        createTagCategoryUIElement(key, category.name);
    }
}

// Load tag categories from local storage
async function loadLocalTagCategories() {
    try {
        const { invoke } = window.__TAURI__.core;
        const localTagCategories = await invoke('list_tag_categories');
        
        if (localTagCategories && Array.isArray(localTagCategories)) {
            localTagCategories.forEach(tc => {
                const key = tc.name.toLowerCase().replace(/\s+/g, '_');
                if (!tagCategories[key]) {
                    tagCategories[key] = {
                        name: tc.name,
                        tags: tc.tags || []
                    };
                }
            });
        }
    } catch (error) {
        console.log('Failed to load local tag categories:', error);
    }
}

// Save tag category to local storage
async function saveTagCategoryToLocal(key) {
    try {
        const { invoke } = window.__TAURI__.core;
        const tagCategory = tagCategories[key];
        if (tagCategory) {
            await invoke('save_tag_category', {
                name: tagCategory.name,
                tags: tagCategory.tags
            });
        }
    } catch (error) {
        console.log('Failed to save tag category:', error);
    }
}

// Delete tag category from local storage
async function deleteTagCategoryFromLocal(name) {
    try {
        const { invoke } = window.__TAURI__.core;
        await invoke('delete_tag_category', {
            name: name
        });
    } catch (error) {
        console.log('Failed to delete tag category:', error);
    }
}

// Add new tag category UI
async function addTagCategoryUI(name = null) {
    if (!name) {
        name = `Tag Category ${Object.keys(tagCategories).length + 1}`;
    }
    
    const key = addTagCategory(name);
    if (!key) {
        alert('Tag category already exists!');
        return;
    }
    
    createTagCategoryUIElement(key, name);
    updateAllTagCategorySelectors();
    
    // Save to local storage
    await saveTagCategoryToLocal(key);
}

// Create tag category UI element (core function)
function createTagCategoryUIElement(key, name) {
    const tagCategoryDiv = document.createElement('div');
    tagCategoryDiv.className = 'tag-category';
    tagCategoryDiv.dataset.tagCategoryKey = key;
    
    // Create header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'tag-category-header';
    
    // Collapse/expand button
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = '▼';
    
    // Name input
    const nameDiv = document.createElement('div');
    nameDiv.className = 'tag-category-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'tag-category-name-input';
    nameInput.value = name;
    nameInput.placeholder = 'Tag Category Name';
    nameInput.addEventListener('change', async function() {
        const oldName = tagCategories[key].name;
        updateTagCategory(key, this.value);
        updateAllTagCategorySelectors();
        
        // Save to local storage
        await saveTagCategoryToLocal(key);
        
        // If name changed, delete old file
        if (oldName !== this.value) {
            await deleteTagCategoryFromLocal(oldName);
        }
    });
    nameDiv.appendChild(nameInput);
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'export-tag-category-btn';
    exportBtn.textContent = 'Export';
    exportBtn.addEventListener('click', () => handleExportTagCategory(key));
    
    headerDiv.appendChild(collapseBtn);
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(exportBtn);
    
    // Delete button (only for non-default categories)
    if (key !== 'genre' && key !== 'language') {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-tag-category-btn';
        removeBtn.textContent = 'Delete';
        removeBtn.addEventListener('click', async () => {
            const tagCategoryName = tagCategories[key].name;
            deleteTagCategory(key);
            tagCategoryDiv.remove();
            updateAllTagCategorySelectors();
            
            // Delete from local storage
            await deleteTagCategoryFromLocal(tagCategoryName);
        });
        headerDiv.appendChild(removeBtn);
    }
    
    // Content area
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tag-category-content expanded';
    
    // Tags container
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tag-category-tags';
    tagsDiv.dataset.tagCategoryKey = key;
    
    // Add existing tags
    if (tagCategories[key]?.tags) {
        tagCategories[key].tags.forEach(tagName => {
            const tagElement = createTagCategoryTagElement(key, tagName);
            tagsDiv.appendChild(tagElement);
        });
    }
    
    // Tag input
    const tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.className = 'tag-category-input';
    tagInput.placeholder = 'Enter tag, press Enter...';
    
    // Input events
    setupTagInputEvents(tagInput, key, tagsDiv);
    
    contentDiv.appendChild(tagsDiv);
    contentDiv.appendChild(tagInput);
    
    tagCategoryDiv.appendChild(headerDiv);
    tagCategoryDiv.appendChild(contentDiv);
    
    // Insert before the add buttons
    const addActions = tagCategorySection.querySelector('.add-tag-category-actions');
    if (addActions) {
        tagCategorySection.insertBefore(tagCategoryDiv, addActions);
    } else {
        tagCategorySection.appendChild(tagCategoryDiv);
    }
    
    // Collapse functionality
    collapseBtn.addEventListener('click', () => {
        contentDiv.classList.toggle('collapsed');
        contentDiv.classList.toggle('expanded');
        collapseBtn.textContent = contentDiv.classList.contains('expanded') ? '▼' : '▶';
    });
}

// Create tag element for tag category
function createTagCategoryTagElement(key, tagName) {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-category-tag';
    tagElement.textContent = tagName;
    tagElement.addEventListener('click', async () => {
        removeTagFromTagCategory(key, tagName);
        tagElement.remove();
        
        // Save to local storage
        await saveTagCategoryToLocal(key);
    });
    return tagElement;
}

// Setup tag input events
function setupTagInputEvents(input, key, tagsDiv) {
    const handleAddTag = async (tagName) => {
        if (!tagName) return;
        
        if (addTagToTagCategory(key, tagName)) {
            const tagElement = createTagCategoryTagElement(key, tagName);
            tagsDiv.appendChild(tagElement);
            input.value = '';
            
            // Save to local storage
            await saveTagCategoryToLocal(key);
        } else {
            alert('Tag already exists in this category!');
        }
    };
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await handleAddTag(input.value.trim());
        }
    });
    
    input.addEventListener('change', async () => {
        await handleAddTag(input.value.trim());
    });
}
