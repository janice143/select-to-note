
# QuickNote - Web Clipper & Todo

## Overview

QuickNote is a lightweight Chrome extension — part web clipper, part todo. Select text or save page URLs, add your own notes, and mark them done when finished. No sign-in, no sync — just fast, temporary storage.

## Features

- **Web Clipper**: Select text on any page and save it via right-click → "Add to Note Board". Also saves page URLs the same way.
- **Manual Notes**: Add notes directly in the popup with the **add** button.
- **Mark Done**: Right-click any note to toggle it as done/undone.
- **Copy All**: One-click copy of all non-done notes to clipboard.
- **Clear All**: Wipe the board with confirmation.

## Installation

1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing this extension's files.
5. The extension should now be visible in your Chrome toolbar.

## Usage

1. Right-click on a web page and use the context menu to add selected text or the page URL to QuickNote.
2. Open the QuickNote popup from the Chrome toolbar to view your saved notes.
3. Use the **Copy to Clipboard** button to copy all notes.
4. Use the **Clear** button to delete all saved notes.

## Limitations

- This extension is designed for **temporary, lightweight use**. Do not rely on it for persistent or large-scale data storage.
- `chrome.storage.sync` has a quota — keep notes short and few.

## Development

To contribute or modify this extension:

1. Fork the repository.
2. Make your changes in a new branch.
3. Submit a pull request for review.

---

# QuickNote - 网页剪辑器 & 待办

## 概述

QuickNote 是一个轻量级 Chrome 插件 — 既是网页剪辑器，也是待办工具。选中网页文字或保存页面链接，手动添加笔记，完成了就标记为 done。不登录、不同步 — 快，简单，临时用。

## 功能特点

- **网页剪辑**：在任意页面选中文字 → 右键 "Add to Note Board" 保存，也可以右键页面保存链接。
- **手动添加**：在弹出窗口里点 **add** 按钮直接输入笔记。
- **标记完成**：右键任意笔记切换 done/undone 状态。
- **复制全部**：一键复制所有未完成笔记到剪贴板。
- **清空**：点 clear 带确认框清空全部笔记。

## 安装步骤

1. 克隆或下载本项目。
2. 打开 Chrome 浏览器，并访问 `chrome://extensions/`。
3. 在页面右上角启用**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择包含插件文件的目录。
5. 该扩展程序现在应该显示在 Chrome 工具栏中。

## 使用说明

1. 在网页上右键单击，通过上下文菜单将选中的文本或网页 URL 添加到 QuickNote。
2. 从 Chrome 工具栏打开 QuickNote 弹出窗口，查看已保存的笔记。
3. 使用**复制到剪贴板**按钮复制所有笔记。
4. 使用**清空**按钮删除所有已保存的笔记。

## 限制

- 本插件仅用于**临时、轻量使用**。不适合依赖它做持久化或大规模存储。
- `chrome.storage.sync` 有配额限制，笔记宜短宜少。

## 开发

如需贡献或修改此插件：

1. Fork 本仓库。
2. 在新分支上进行更改。
3. 提交 Pull Request 以供审查。
