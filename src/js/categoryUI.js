// Category UI Management

let categoryCount = 0;

// Add new category
function addCategory(name = null, tagCategoryKey = null) {
    const existingCategories = document.querySelectorAll('.category');
    const existingCategoryNames = Array.from(existingCategories).map(cat => 
        cat.querySelector('.category-name-input').value
    );
    
    // Handle default categories
    if (!name) {
        const defaultCategories = ['Genre', 'Language'];
        if (categoryCount < defaultCategories.length) {
            name = defaultCategories[categoryCount];
            if (!tagCategoryKey) {
                const tagCategoryKeys = Object.keys(tagCategories);
                if (categoryCount < tagCategoryKeys.length) {
                    tagCategoryKey = tagCategoryKeys[categoryCount];
                }
            }
        } else {
            name = `Category ${++categoryCount}`;
        }
    }
    
    // Check if default category already exists
    if (['Genre', 'Language'].includes(name) && existingCategoryNames.includes(name)) {
        alert(`Default category "${name}" already exists!`);
        return;
    }
    
    categoryCount++;
    const categoryId = `category-${categoryCount}`;
    
    createCategoryElement(categoryId, name, tagCategoryKey);
    
    return categoryId;
}

// Create category DOM element
function createCategoryElement(categoryId, name, tagCategoryKey) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    categoryDiv.dataset.categoryId = categoryId;
    
    // Name input
    const nameDiv = document.createElement('div');
    nameDiv.className = 'category-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'category-name-input';
    nameInput.value = name;
    nameInput.placeholder = 'Category Name';
    if (['Genre', 'Language'].includes(name)) {
        nameInput.disabled = true;
    }
    nameDiv.appendChild(nameInput);
    
    // Tag category selector
    const tagCategoryDiv = document.createElement('div');
    tagCategoryDiv.className = 'category-tag-category';
    const tagCategorySelect = document.createElement('select');
    tagCategorySelect.className = 'tag-category-select';
    tagCategorySelect.innerHTML = '<option value="">-- Select Tag Category --</option>';
    updateTagCategoryOptions(tagCategorySelect, tagCategoryKey);
    if (['Genre', 'Language'].includes(name)) {
        tagCategorySelect.disabled = true;
    }
    tagCategorySelect.addEventListener('change', () => {
        const selectedTagCategory = tagCategorySelect.value;
        
        // Don't allow selecting Genre and Language as Tag Categories for custom categories
        if (!['Genre', 'Language'].includes(name) && (selectedTagCategory === 'genre' || selectedTagCategory === 'language')) {
            alert('You cannot select Genre or Language as Tag Categories for custom categories!');
            tagCategorySelect.value = '';
            return;
        }
        
        // Just set the category without auto-importing
        setCategoryTagCategory(categoryId, selectedTagCategory);
        
        // Show/hide Import All button based on selection
        if (importAllBtn) {
            importAllBtn.style.display = selectedTagCategory ? 'inline-block' : 'none';
        }
    });
    tagCategoryDiv.appendChild(tagCategorySelect);
    
    // Tags container
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'category-tags';
    tagsDiv.dataset.categoryId = categoryId;
    
    // Tag input with suggestions
    const tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.className = 'tag-input';
    tagInput.placeholder = 'Enter tag, press Enter...';
    tagInput.setAttribute('list', `tag-suggestions-${categoryId}`);
    
    const datalist = document.createElement('datalist');
    datalist.id = `tag-suggestions-${categoryId}`;
    updateTagSuggestions(datalist, tagCategoryKey);
    
    tagCategorySelect.addEventListener('change', () => {
        updateTagSuggestions(datalist, tagCategorySelect.value);
    });
    
    // Import all tags button (only for non-default categories)
    let importAllBtn = null;
    if (!['Genre', 'Language'].includes(name)) {
        importAllBtn = document.createElement('button');
        importAllBtn.className = 'import-all-tags-btn';
        importAllBtn.textContent = 'Import all';
        importAllBtn.style.display = tagCategoryKey ? 'inline-block' : 'none';
        importAllBtn.addEventListener('click', () => {
            const selectedTagCategory = tagCategorySelect.value;
            if (selectedTagCategory) {
                importAllTagsToCategory(selectedTagCategory, categoryId);
            } else {
                alert('Please select a Tag Category first!');
            }
        });
    }
    
    setupCategoryTagInput(tagInput, categoryId, tagCategoryKey);
    
    // Delete button (only for non-default categories)
    let removeBtn = null;
    if (!['Genre', 'Language'].includes(name)) {
        removeBtn = document.createElement('button');
        removeBtn.className = 'remove-category-btn';
        removeBtn.textContent = 'Delete';
        removeBtn.addEventListener('click', () => {
            categoryDiv.style.transform = 'translateX(-100%)';
            categoryDiv.style.opacity = '0';
            setTimeout(() => {
                categoryDiv.remove();
                updateOutput();
            }, 300);
        });
    }
    
    // Assemble category
    categoryDiv.appendChild(nameDiv);
    categoryDiv.appendChild(tagCategoryDiv);
    if (importAllBtn) {
        categoryDiv.appendChild(importAllBtn);
    }
    categoryDiv.appendChild(tagsDiv);
    categoryDiv.appendChild(tagInput);
    categoryDiv.appendChild(datalist);
    if (removeBtn) {
        categoryDiv.appendChild(removeBtn);
    }
    
    categorySection.appendChild(categoryDiv);
    
    // Set initial mapping
    if (tagCategoryKey) {
        setCategoryTagCategory(categoryId, tagCategoryKey);
    }
}

// Setup category tag input events
function setupCategoryTagInput(input, categoryId, initialTagCategoryKey) {
    const handleAddTag = (tagName) => {
        if (!tagName) return;
        
        if (canAddTagToCategory(tagName, categoryId)) {
            addTagToCategory(tagName, categoryId, getCategoryTagCategory(categoryId));
            input.value = '';
            updateOutput();
        } else {
            const categoryTagCat = getCategoryTagCategory(categoryId);
            const availableTags = categoryTagCat ? 
                tagCategories[categoryTagCat].tags.join(', ') : 
                'any tag';
            alert(`This category only accepts: ${availableTags}`);
        }
    };
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTag(input.value.trim());
        }
    });
    
    input.addEventListener('change', () => {
        handleAddTag(input.value.trim());
    });
}

// Add tag to category
function addTagToCategory(tagName, categoryId, tagCategory = null) {
    const categoryTags = document.querySelector(`.category-tags[data-category-id="${categoryId}"]`);
    if (!categoryTags) return;
    
    // Check if tag already exists
    const existingTags = categoryTags.querySelectorAll('.tag');
    for (let tag of existingTags) {
        if (tag.textContent.replace('×', '').trim() === tagName) {
            return;
        }
    }
    
    // Get category's tag category
    const categoryTagCat = getCategoryTagCategory(categoryId);
    const isDefaultCategory = (categoryTagCat === 'genre' || categoryTagCat === 'language');
    
    // Remove existing tags for default categories
    if (isDefaultCategory) {
        existingTags.forEach(tag => tag.remove());
    }
    
    const tag = createTagElement(tagName, categoryTagCat);
    categoryTags.appendChild(tag);
}

// Create tag element
function createTagElement(tagName, tagCategory = null) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.draggable = true;
    tag.textContent = tagName;
    
    if (tagCategory) {
        tag.dataset.tagCategory = tagCategory;
    }
    
    // Delete button
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'tag-delete';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tag.remove();
        updateOutput();
    });
    tag.appendChild(deleteBtn);
    
    return tag;
}

// Import all tags from a Tag Category to a category
function importAllTagsToCategory(tagCategoryKey, categoryId) {
    const tags = tagCategories[tagCategoryKey]?.tags || [];
    if (tags.length === 0) return;
    
    // Clear existing tags first
    const categoryTags = document.querySelector(`.category-tags[data-category-id="${categoryId}"]`);
    if (!categoryTags) return;
    
    // Remove existing tags
    const existingTags = categoryTags.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());
    
    // Add all tags from the selected Tag Category
    tags.forEach(tagName => {
        addTagToCategory(tagName, categoryId, tagCategoryKey);
    });
    
    updateOutput();
}

// Update output display
function updateOutput() {
    const categories = document.querySelectorAll('.category');
    const result = [];
    
    categories.forEach(category => {
        const categoryName = category.querySelector('.category-name-input').value;
        const tags = category.querySelectorAll('.category-tags .tag');
        
        if (tags.length > 0) {
            const tagTexts = Array.from(tags).map(tag => tag.textContent.replace('×', '').trim());
            result.push(tagTexts.join(' '));
        }
    });
    
    outputText.textContent = result.join(' ');
}
