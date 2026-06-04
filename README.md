# Camera Bookmarks

A Re:Earth Visualizer plugin that lets users save the current camera position with a name and fly back to it later. Bookmarks persist in the browser across sessions.

## Features

- Save the current camera position with a custom name
- Auto-name fallback ("Bookmark 1", "Bookmark 2"…) if no name is entered
- One-click fly-to with smooth animation
- Delete individual bookmarks
- Persists across browser sessions (per device / per browser)
- Empty-state message when no bookmarks exist
- Corrupted entries are skipped, not crashed on

## Usage

1. Install the plugin.
2. Add the **Camera Bookmarks** widget from the widget panel.
3. Navigate to a view you want to save, click **Save Bookmark**, name it, confirm.
4. Click **Fly to** on any saved bookmark to return to that view.
5. Click the red **×** to delete a bookmark.

## Storage scope

Bookmarks are stored via Re:Earth's `clientStorage`, which is **per browser, per device, per project**. They are not synced across devices or accounts.

## Error behavior

| Situation | Behavior |
| --- | --- |
| No bookmarks saved | Shows "No bookmarks yet" |
| `clientStorage` unavailable | Shows an error banner; plugin remains usable but bookmarks won't persist |
| Corrupted bookmark entry | Skipped silently; valid entries continue to load |

## Files

```
camera-bookmarks/
├── reearth.yml
├── camera-bookmarks.js
└── README.md
```

## License

Apache-2.0
