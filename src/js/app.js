// Main Application Entry Point
// This file coordinates all modules and handles global events

// DOM Elements
const categorySection = document.getElementById('categorySection');
const tagCategorySection = document.getElementById('tagCategorySection');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const outputText = document.getElementById('outputText');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const sectionCollapseBtn = document.getElementById('sectionCollapseBtn');

let draggedTag = null;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await init();
});

async function init() {
    // Create default categories
    addCategory('Genre', 'genre');
    addCategory('Language', 'language');
    
    // Create tag category UI for custom categories
    await initTagCategoryUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Bind events to existing import button
    bindImportButtonEvent();
}

function bindImportButtonEvent() {
    const importBtn = document.getElementById('importTagCategoryBtn');
    if (importBtn) {
        importBtn.addEventListener('click', handleImportTagCategory);
    }
    
    const addBtn = document.getElementById('addTagCategoryBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => addTagCategoryUI());
    }
}

function setupEventListeners() {
    // Category management
    addCategoryBtn.addEventListener('click', () => addCategory());
    
    // File operations
    openBtn.addEventListener('click', handleOpen);
    saveBtn.addEventListener('click', handleSave);
    
    // Section collapse
    sectionCollapseBtn.addEventListener('click', toggleSectionCollapse);
    
    // Global drag events
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    // Category section drag and drop
    categorySection.addEventListener('dragover', handleDragOver);
    categorySection.addEventListener('dragleave', handleDragLeave);
    categorySection.addEventListener('drop', handleDrop);
}

function toggleSectionCollapse() {
    tagCategorySection.classList.toggle('collapsed');
    tagCategorySection.classList.toggle('expanded');
    sectionCollapseBtn.textContent = tagCategorySection.classList.contains('expanded') ? '▼' : '▶';
}

// Drag and Drop Handlers
function handleDragStart(e) {
    if (e.target.classList.contains('tag')) {
        draggedTag = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('tag')) {
        e.target.classList.remove('dragging');
        draggedTag = null;
    }
}

function handleDragOver(e) {
    if (e.target.classList.contains('category-tags')) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('category-tags')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.target.classList.contains('category-tags')) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        if (draggedTag) {
            const categoryId = e.target.dataset.categoryId;
            const tagName = draggedTag.textContent.replace('×', '').trim();
            const tagCategory = draggedTag.dataset.tagCategory;
            
            if (canAddTagToCategory(tagName, categoryId)) {
                addTagToCategory(tagName, categoryId, tagCategory);
                draggedTag.remove();
                updateOutput();
            }
        }
    }
}
