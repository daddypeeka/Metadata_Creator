// 标签分类管理
const tagCategories = {
    'genre': {
        name: 'Genre',
        tags: ['Video Game', 'Anime', 'Rock', 'Pop', 'Other', 'Novelty', 'Hip Hop', 'Electronic', 'Metal', 'Classical', 'Folk', 'Jazz'],
    },
    'language': {
        name: 'Language',
        tags: ['English', 'Chinese', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Spanish', 'Swedish', 'Russian', 'Polish', 'Instrumental', 'Unspecified', 'Other'],
    }
};

// 分类到标签分类的映射
const categoryTagMapping = {};

// 添加新的标签分类
function addTagCategory(name) {
    // 生成唯一的键（小写，空格替换为下划线）
    const key = name.toLowerCase().replace(/\s+/g, '_');
    
    // 检查是否已存在
    if (tagCategories[key]) {
        return null;
    }
    
    tagCategories[key] = {
        name: name,
        tags: []
    };
    
    return key;
}

// 编辑标签分类名称
function updateTagCategory(key, newName) {
    if (tagCategories[key]) {
        tagCategories[key].name = newName;
        return true;
    }
    return false;
}

// 删除标签分类
function deleteTagCategory(key) {
    if (tagCategories[key]) {
        delete tagCategories[key];
        return true;
    }
    return false;
}

// 向标签分类添加标签
function addTagToTagCategory(tagCategoryKey, tagName) {
    if (tagCategories[tagCategoryKey]) {
        if (!tagCategories[tagCategoryKey].tags.includes(tagName)) {
            tagCategories[tagCategoryKey].tags.push(tagName);
            return true;
        }
    }
    return false;
}

// 从标签分类移除标签
function removeTagFromTagCategory(tagCategoryKey, tagName) {
    if (tagCategories[tagCategoryKey]) {
        const index = tagCategories[tagCategoryKey].tags.indexOf(tagName);
        if (index > -1) {
            tagCategories[tagCategoryKey].tags.splice(index, 1);
            return true;
        }
    }
    return false;
}

// 设置分类的标签分类
function setCategoryTagCategory(categoryId, tagCategoryKey) {
    categoryTagMapping[categoryId] = tagCategoryKey;
}

// 获取分类的标签分类
function getCategoryTagCategory(categoryId) {
    return categoryTagMapping[categoryId];
}

// 检查标签是否可以添加到分类
function canAddTagToCategory(tagName, categoryId) {
    const tagCategoryKey = categoryTagMapping[categoryId];
    
    // 如果没有设置标签分类，允许任何标签
    if (!tagCategoryKey) {
        return true;
    }
    
    // 检查标签是否在对应的标签分类中
    const tagCategory = tagCategories[tagCategoryKey];
    if (tagCategory) {
        return tagCategory.tags.includes(tagName);
    }
    
    return true;
}

// 获取标签的标签分类
function getTagCategory(tagName) {
    for (const [key, category] of Object.entries(tagCategories)) {
        if (category.tags.includes(tagName)) {
            return key;
        }
    }
    return null;
}

// 初始化默认分类映射
function initDefaultCategoryMapping() {
    // 默认分类1映射到genre
    categoryTagMapping['category-1'] = 'genre';
    // 默认分类2映射到language
    categoryTagMapping['category-2'] = 'language';
}