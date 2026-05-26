# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type

Chrome Extension (Manifest V3) - QuickNote, a web clipper and todo.

## Architecture

```
background.js      ← Service worker: context menus, storage operations
popup.js          ← Popup UI logic: rendering notes, clipboard, toasts
index.html        ← Popup HTML structure
style.css         ← Popup styling with CSS custom properties
manifest.json     ← Extension manifest (permissions, icons, popup config)
```

## Data Flow

1. User right-clicks text/page → `background.js` context menu handler captures selection
2. `background.js` stores notes via `chrome.storage.sync.set()`
3. User opens popup → `popup.js` reads notes via `chrome.storage.sync.get()`
4. Notes render as `<p>` elements with click-to-strikethrough behavior
5. Copy/Clear buttons modify storage and re-render

## Development Commands

No build step required. To test changes:
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this directory
4. The extension reloads automatically on file save (click the refresh icon)

## Key Implementation Details

- **Storage**: Notes persist in `chrome.storage.sync` as `{ noteList: string[] }`
- **Context menus**: Two menus created on install — "Add to Note Board" (selection) and "Add Page URL to Note Board" (page)
- **Note rendering**: `popup.js` filters out UI-deleted notes (class `deleted`) before copying
- **Toast system**: `Toast` class in `popup.js` handles success/warning/error notifications
- **Clipboard**: `navigator.clipboard.writeText()` joins notes with newlines

## Important Constraints

- Manifest V3 service worker has no DOM access — UI logic lives in `popup.js`
- Storage quota applies (`chrome.storage.sync` has limits)
- This extension is intentionally temporary storage only (per README)