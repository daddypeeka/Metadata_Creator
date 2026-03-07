# Metadata Creator

[English Version](README_EN.md)

一个用于组织和管理标签分类的元数据管理工具。

## 功能特性

- 标签分类管理：创建、编辑和删除自定义标签分类
- 分类系统：将标签组织到分类中，支持灵活的映射关系
- 导入导出：支持导入和导出标签分类及项目文件
- 本地存储：标签分类保存在应用程序目录中
- 模板系统：Example文件夹用于存储模板文件

## 安装说明

1. 从发布页面下载最新版本
2. 将压缩包解压到您希望的位置
3. 运行 `Metadata Creator.exe`

## 使用指南

### 标签分类管理

- 点击 "Add New Tag Category" 创建新的标签分类
- 使用 "Import Tag Category" 从JSON文件导入标签分类
- 使用 "Export" 按钮导出单个标签分类

### 分类管理

- 使用 "Add Category" 按钮添加新的分类
- 为每个分类选择一个标签分类
- 使用 "Import all" 从选定的标签分类导入所有标签
- 手动添加单个标签或通过拖放操作添加

### 文件操作

- 打开：从Example文件夹或其他位置加载项目文件
- 保存：导出整个项目，包括所有标签分类和分类

## 文件结构

```
Metadata Creator/
├── tag_categories/          # 标签分类存储
├── Example/                 # 模板文件
└── Metadata Creator.exe     # 应用程序
```

## 配置说明

标签分类会自动保存到应用程序目录下的 `tag_categories` 文件夹中。每个标签分类都存储为单独的JSON文件。

## 许可证

MIT 许可证

## 作者

Mis Fortune
