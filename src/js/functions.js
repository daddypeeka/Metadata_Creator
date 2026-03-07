// Helper Functions - Shared utilities

// Update tag category options in select element
function updateTagCategoryOptions(selectElement, selectedKey = null) {
    selectElement.innerHTML = '';
    
    for (const [key, category] of Object.entries(tagCategories)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = category.name;
        if (key === selectedKey) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    }
}

// Update all tag category selectors
function updateAllTagCategorySelectors() {
    document.querySelectorAll('.tag-category-select').forEach(select => {
        const currentValue = select.value;
        updateTagCategoryOptions(select, currentValue);
    });
}

// Update tag suggestions in datalist
function updateTagSuggestions(datalist, tagCategoryKey) {
    datalist.innerHTML = '';
    
    if (tagCategoryKey && tagCategories[tagCategoryKey]) {
        tagCategories[tagCategoryKey].tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            datalist.appendChild(option);
        });
    }
}
