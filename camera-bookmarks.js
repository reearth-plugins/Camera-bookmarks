const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      /* Reset */
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #E2E8F0;
      }

      /* Panel */
      .panel {
        width: 280px;
        background: #252A35;
        border-radius: 12px;
        box-sizing: border-box;
        overflow: hidden;
      }

      /* Header */
      .header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 16px;
        font-size: 14px;
        font-weight: 600;
        color: white;
        border-bottom: 1px solid #3A3F4E;
      }
      .header svg { color: #4A7CFF; }

      /* Action area (Save button OR naming row) */
      .action {
        padding: 16px;
        border-bottom: 1px solid #3A3F4E;
      }

      .btn-primary {
        width: 100%;
        height: 36px;
        background: #4A7CFF;
        color: white;
        border: 0;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
      }
      .btn-primary:hover { background: #5C8AFF; }
      .btn-primary:active { background: #3D6EE6; }

      /* Naming row */
      .name-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .name-input {
        flex: 1;
        height: 36px;
        background: #1C1F26;
        border: 1px solid #3B82F6;
        border-radius: 8px;
        padding: 0 10px;
        font-size: 12px;
        font-family: inherit;
        color: #E2E8F0;
        box-sizing: border-box;
        outline: none;
      }
      .name-input::placeholder { color: #6B7280; }

      .btn-icon {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .btn-cancel { background: #3B1F1F; color: #F87171; }
      .btn-cancel:hover { background: #4A2424; }
      .btn-confirm { background: #3B82F6; color: white; }
      .btn-confirm:hover { background: #5294F8; }

      /* List */
      .list {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 220px;
      }

      .empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #6B7280;
        font-size: 12px;
        font-style: italic;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .item-name {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #E2E8F0;
        min-width: 0;
      }
      .item-name span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .item-name svg { flex-shrink: 0; color: #4A7CFF; }

      .btn-flyto {
        height: 26px;
        padding: 0 14px;
        background: #2D3344;
        color: #93C5FD;
        border: 0;
        border-radius: 6px;
        font-size: 10px;
        font-family: inherit;
        cursor: pointer;
      }
      .btn-flyto:hover { background: #353C50; }
      .btn-delete {
        width: 26px;
        height: 26px;
        background: #3B1F1F;
        color: #F87171;
        border: 0;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .btn-delete:hover { background: #4A2424; }

      .error {
        padding: 12px 16px;
        background: #3B1F1F;
        color: #F87171;
        font-size: 11px;
        line-height: 1.4;
        border-top: 1px solid #3A3F4E;
      }

      .hidden { display: none !important; }
    </style>
  </head>
  <body>
    <div class="panel">
      <!-- Header -->
      <div class="header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12v18l-6-4-6 4V4z"/></svg>
        <span>Camera Bookmarks</span>
      </div>

      <!-- Action area: either the "Add Bookmark" button OR the naming row -->
      <div class="action">
        <button id="addBtn" class="btn-primary">Save Bookmark</button>
        <div id="nameRow" class="name-row hidden">
          <input id="nameInput" class="name-input" type="text" placeholder="Enter a name..." maxlength="60" />
          <button id="cancelBtn" class="btn-icon btn-cancel" aria-label="Cancel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
          <button id="confirmBtn" class="btn-icon btn-confirm" aria-label="Save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
          </button>
        </div>
      </div>

      <!-- Bookmark list (or empty state) -->
      <div class="list" id="list"></div>

      <!-- Error banner (only shown when storage fails) -->
      <div id="errorBanner" class="error hidden"></div>
    </div>

    <script>
      // ─────────── DOM refs ───────────
      const addBtn = document.getElementById("addBtn");
      const nameRow = document.getElementById("nameRow");
      const nameInput = document.getElementById("nameInput");
      const cancelBtn = document.getElementById("cancelBtn");
      const confirmBtn = document.getElementById("confirmBtn");
      const listEl = document.getElementById("list");
      const errorBanner = document.getElementById("errorBanner");

      // ─────────── Local state (mirror of WASM-side bookmarks) ───────────
      let bookmarks = [];

      // ─────────── Rendering ───────────
      function pinIcon() {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
      }

      function renderList() {
        if (bookmarks.length === 0) {
          listEl.innerHTML =
            '<div class="empty">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4h12v18l-6-4-6 4V4z"/></svg>' +
              '<div>No bookmarks yet</div>' +
            '</div>';
          return;
        }

        // Build items via DOM (safer than innerHTML for user-provided names)
        listEl.innerHTML = "";
        bookmarks.forEach((b) => {
          const item = document.createElement("div");
          item.className = "item";

          const name = document.createElement("div");
          name.className = "item-name";
          name.innerHTML = pinIcon();
          const nameText = document.createElement("span");
          nameText.textContent = b.name;
          name.appendChild(nameText);

          const flyBtn = document.createElement("button");
          flyBtn.className = "btn-flyto";
          flyBtn.textContent = "Fly to";
          flyBtn.addEventListener("click", () => {
            parent.postMessage({ type: "flyTo", id: b.id }, "*");
          });

          const delBtn = document.createElement("button");
          delBtn.className = "btn-delete";
          delBtn.setAttribute("aria-label", "Delete");
          delBtn.innerHTML =
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>';
          delBtn.addEventListener("click", () => {
            parent.postMessage({ type: "delete", id: b.id }, "*");
          });

          item.append(name, flyBtn, delBtn);
          listEl.appendChild(item);
        });
      }

      // Switch the action area between the button and the naming row
      function setNamingMode(on) {
        addBtn.classList.toggle("hidden", on);
        nameRow.classList.toggle("hidden", !on);
        if (on) {
          nameInput.value = "";
          nameInput.focus();
        }
      }

      function showError(message) {
        if (!message) {
          errorBanner.classList.add("hidden");
          errorBanner.textContent = "";
        } else {
          errorBanner.textContent = message;
          errorBanner.classList.remove("hidden");
        }
      }

      // ─────────── Event wiring ───────────
      addBtn.addEventListener("click", () => setNamingMode(true));
      cancelBtn.addEventListener("click", () => setNamingMode(false));

      function confirmSave() {
        // Empty name → let the WASM side auto-name it ("Bookmark N").
        const name = nameInput.value.trim();
        parent.postMessage({ type: "save", name }, "*");
        setNamingMode(false);
      }
      confirmBtn.addEventListener("click", confirmSave);
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirmSave();
        else if (e.key === "Escape") setNamingMode(false);
      });

      // ─────────── Inbound messages from WASM ───────────
      window.addEventListener("message", (e) => {
        const msg = e.data;
        if (!msg) return;
        if (msg.type === "state") {
          bookmarks = Array.isArray(msg.bookmarks) ? msg.bookmarks : [];
          renderList();
          if (msg.error) showError(msg.error);
          else showError(null);
          // The button label changes based on whether we have any bookmarks.
          addBtn.textContent = bookmarks.length === 0 ? "Save Bookmark" : "Add Bookmark";
        }
      });

      // Tell the WASM side we're ready for the initial state.
      parent.postMessage({ type: "ready" }, "*");
    </script>
  </body>
</html>
`;

// ═══════════════════════════════════════════════════════════════
// WASM-side: camera + clientStorage + message routing
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "camera-bookmarks:list";
const FLY_DURATION = 2; // seconds

reearth.ui.show(html);

// In-memory copy of the bookmark list, kept in sync with clientStorage.
let bookmarks = [];
let storageError = null;

// Push the current state to the iframe.
const sendState = () => {
  reearth.ui.postMessage({
    type: "state",
    bookmarks,
    error: storageError,
  });
};

// Validate one bookmark entry. Used to skip corrupted records.
const isValidBookmark = (b) =>
  b &&
  typeof b.id === "string" &&
  typeof b.name === "string" &&
  b.camera &&
  typeof b.camera.lat === "number" &&
  typeof b.camera.lng === "number" &&
  typeof b.camera.height === "number";

// Load bookmarks from clientStorage. Corrupted entries are silently skipped.
const loadBookmarks = async () => {
  try {
    const stored = await reearth.data.clientStorage.getAsync(STORAGE_KEY);
    if (Array.isArray(stored)) {
      bookmarks = stored.filter(isValidBookmark);
    } else {
      bookmarks = [];
    }
    storageError = null;
  } catch (e) {
    bookmarks = [];
    storageError = "Bookmarks cannot be saved on this browser.";
  }
};

// Persist current bookmarks back to clientStorage.
const persist = async () => {
  try {
    await reearth.data.clientStorage.setAsync(STORAGE_KEY, bookmarks);
    storageError = null;
  } catch (e) {
    storageError = "Bookmarks cannot be saved on this browser.";
  }
};

// Generate a default name like "Bookmark 1", "Bookmark 2"...
// Picks the smallest positive integer N not already in use.
const nextDefaultName = () => {
  const used = new Set(
    bookmarks
      .map((b) => {
        const m = /^Bookmark (\d+)$/.exec(b.name);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((n) => n !== null)
  );
  let n = 1;
  while (used.has(n)) n++;
  return "Bookmark " + n;
};

// Read the current camera state. The spec requires all 6 fields.
const captureCamera = () => {
  const c = reearth.camera.position;
  if (!c) return null;
  return {
    lat: c.lat,
    lng: c.lng,
    height: c.height,
    heading: c.heading,
    pitch: c.pitch,
    roll: c.roll,
  };
};

// ─────────── Action handlers ───────────

const handleSave = async ({ name }) => {
  const camera = captureCamera();
  if (!camera) return; // No camera available; nothing to save.
  const finalName = (name && name.trim()) || nextDefaultName();
  bookmarks.push({
    id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
    name: finalName,
    camera,
  });
  await persist();
  sendState();
};

const handleFlyTo = ({ id }) => {
  const b = bookmarks.find((x) => x.id === id);
  if (!b) return;
  reearth.camera.flyTo(b.camera, { duration: FLY_DURATION });
};

const handleDelete = async ({ id }) => {
  bookmarks = bookmarks.filter((b) => b.id !== id);
  await persist();
  sendState();
};

// ─────────── Message routing from iframe ───────────

reearth.extension.on("message", (msg) => {
  if (!msg) return;
  switch (msg.type) {
    case "ready":
      // First contact: load from storage then push initial state.
      loadBookmarks().then(sendState);
      break;
    case "save":
      handleSave(msg);
      break;
    case "flyTo":
      handleFlyTo(msg);
      break;
    case "delete":
      handleDelete(msg);
      break;
  }
});
