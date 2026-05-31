const titleEl = document.querySelector('#title');
const noteListEl = document.querySelector('#noteList');
const clsBtnEl = document.querySelector('.clear');
const cpAllBtnEl = document.querySelector('.copy-all');
const addNoteBtnEl = document.querySelector('.add-note-btn');
const noteInputEl = document.querySelector('#noteInput');
const inputRowEl = document.querySelector('.input-row');
const addBtnEl = document.querySelector('.add');
const contextMenuEl = document.querySelector('#contextMenu');

const TOAST_THEME_MAP = {
  SUCCESS: { label: 'success', value: 'toast-success' },
  WARNING: { label: 'warning', value: 'toast-warning' },
  ERROR: { label: 'error', value: 'toast-error' }
};

const NOTE_ELEMENT_CLASS_NAME = 'note-item';

let selectedNoteId = null;
let pendingDeleteId = null;
let isInputVisible = false;
let lastClickId = null;
let lastClickTime = 0;
let pendingCopyId = null;
let pendingCopyTimer = null;
let isEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
  addNoteToBoard();
});

const toggleInput = () => {
  isInputVisible = !isInputVisible;
  inputRowEl.classList.toggle('hidden', !isInputVisible);
  if (isInputVisible) {
    noteInputEl.focus();
  } else {
    noteInputEl.value = '';
  }
};

addNoteBtnEl.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleInput();
});

clsBtnEl.addEventListener('click', async () => {
  const noteList = await getNoteListProm();
  if (!noteList.length) return;
  if (pendingDeleteId === 'clear') return;
  pendingDeleteId = 'clear';
  showInlineConfirm('Clear all notes?', async () => {
    try {
      await initNoteList();
      showToast('Cleared');
    } catch (error) {
      showToast('Failed to clear', TOAST_THEME_MAP.ERROR.label);
    } finally {
      pendingDeleteId = null;
    }
  }, () => {
    pendingDeleteId = null;
  });
});

cpAllBtnEl.addEventListener('click', async () => {
  try {
    const flag = await copyToClipboard();
    flag
      ? showToast('Copied all')
      : showToast('Nothing to copy', TOAST_THEME_MAP.WARNING.label);
  } catch (error) {
    showToast('Copy failed', TOAST_THEME_MAP.ERROR.label);
  }
});

noteInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitInput();
  } else if (e.key === 'Escape') {
    toggleInput();
  }
});

const submitInput = () => {
  const text = noteInputEl.value.trim();
  if (!text) return;
  addNoteFromInput(text).then(() => {
    noteInputEl.value = '';
    toggleInput();
  });
};

addBtnEl.addEventListener('click', () => {
  submitInput();
});

const getNoteListProm = async () => {
  try {
    const res = await chrome.storage.sync.get();
    const { noteList = [] } = res;
    return noteList;
  } catch (error) {
    console.error('Error fetching note list:', error);
    return [];
  }
};

const setNoteList = async (noteList) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ noteList }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving noteList:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

const initNoteList = async () => {
  await setNoteList([]);
  showEmpty();
};

const addNoteFromInput = async (text) => {
  const noteList = await getNoteListProm();
  noteList.push({ id: generateId(), text, done: false });
  await setNoteList(noteList);
  await refreshNoteBoard();
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const onNoteClick = async (e) => {
  const id = e.currentTarget.dataset.id;

  // Don't trigger copy if we're editing a note
  if (isEditingId) return;

  // Cancel any pending copy if this click is part of a double-click sequence
  if (pendingCopyId === id) {
    clearTimeout(pendingCopyTimer);
    pendingCopyId = null;
    pendingCopyTimer = null;
    return;
  }

  // Set a pending copy action; cancelled if dblclick fires before it runs
  pendingCopyId = id;
  pendingCopyTimer = setTimeout(async () => {
    pendingCopyId = null;
    pendingCopyTimer = null;
    try {
      const noteList = await getNoteListProm();
      const note = noteList.find((n) => n.id === id);
      if (note) {
        await navigator.clipboard.writeText(note.text);
        showToast('Copied');
      }
    } catch (error) {
      showToast('Copy failed', TOAST_THEME_MAP.ERROR.label);
    }
  }, 300);
};

const onNoteContextmenu = (e) => {
  e.preventDefault();
  selectedNoteId = e.currentTarget.dataset.id;
  showContextMenu(e);
};

const onNoteDblclick = (e) => {
  e.stopPropagation();
  const id = e.currentTarget.dataset.id;
  // Cancel any pending copy that would have fired from the first click
  if (pendingCopyId === id) {
    clearTimeout(pendingCopyTimer);
    pendingCopyId = null;
    pendingCopyTimer = null;
  }
  startEdit(id, e.currentTarget);
};

const addNoteToBoard = async () => {
  const noteList = await getNoteListProm();
  noteListEl.innerHTML = '';
  noteListEl.classList.remove('empty-state');
  if (!noteList.length) return;

  const fragment = document.createDocumentFragment();

  noteList.forEach((note, index) => {
    const noteElement = document.createElement('p');
    noteElement.classList.add(NOTE_ELEMENT_CLASS_NAME);
    noteElement.dataset.id = note.id;
    noteElement.textContent = note.text;
    noteElement.insertAdjacentHTML('afterbegin', `<span class="idx">${index + 1}.</span> `);

    if (note.done) {
      noteElement.classList.add('done');
    }

    noteElement.addEventListener('click', onNoteClick);
    noteElement.addEventListener('contextmenu', onNoteContextmenu);
    noteElement.addEventListener('dblclick', onNoteDblclick);

    fragment.appendChild(noteElement);
  });

  noteListEl.appendChild(fragment);
};

const refreshNoteBoard = async () => {
  pendingDeleteId = null;
  hideInlineConfirm();
  hideNoteConfirm();
  await addNoteToBoard();
};

const showNoteConfirm = (noteEl, label, onConfirm) => {
  hideNoteConfirm();
  const row = document.createElement('div');
  row.classList.add('confirm-row', 'confirm-row--note');
  row.innerHTML = `
    <span class="confirm-label">${label}</span>
    <button class="btn-confirm">delete</button>
    <button class="btn-cancel">cancel</button>
  `;
  row.querySelector('.btn-confirm').addEventListener('click', async () => {
    await onConfirm();
    hideNoteConfirm();
  });
  row.querySelector('.btn-cancel').addEventListener('click', () => {
    hideNoteConfirm();
  });
  noteEl.after(row);
};

const hideNoteConfirm = () => {
  const existing = noteListEl.querySelector('.confirm-row--note');
  if (existing) existing.remove();
};

const showInlineConfirm = (label, onConfirm, onCancel) => {
  hideInlineConfirm();
  const row = document.createElement('div');
  row.classList.add('confirm-row', 'confirm-row--inline');
  row.innerHTML = `
    <span class="confirm-label">${label}</span>
    <button class="btn-confirm">confirm</button>
    <button class="btn-cancel">cancel</button>
  `;
  row.querySelector('.btn-confirm').addEventListener('click', async () => {
    await onConfirm();
    hideInlineConfirm();
  });
  row.querySelector('.btn-cancel').addEventListener('click', () => {
    onCancel();
    hideInlineConfirm();
  });
  noteListEl.prepend(row);
};

const hideInlineConfirm = () => {
  const existing = noteListEl.querySelector('.confirm-row--inline');
  if (existing) existing.remove();
};

const showEmpty = () => {
  noteListEl.textContent = 'Nothing here yet~';
  noteListEl.insertAdjacentHTML('beforeend', `<span class="empty-hint">Select text on a page and right-click → "Add to Note Board", or click <b>+</b> above to add manually.</span>`);
  noteListEl.classList.add('empty-state');
};

const copyToClipboard = async () => {
  const noteList = await getNoteListProm();
  if (!noteList.length) return false;

  const textToCopy = noteList
    .map((n) => n.text)
    .join('\n');

  if (!textToCopy) return false;

  try {
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

const showContextMenu = async (e) => {
  let x = e.clientX;
  let y = e.clientY;

  // Temporarily show to measure; hide it immediately after
  contextMenuEl.classList.remove('hidden');
  const menuRect = contextMenuEl.getBoundingClientRect();
  contextMenuEl.classList.add('hidden');

  if (x + menuRect.width > window.innerWidth) {
    x = window.innerWidth - menuRect.width - 4;
  }
  if (y + menuRect.height > window.innerHeight) {
    y = window.innerHeight - menuRect.height - 4;
  }

  const noteList = await getNoteListProm();
  const note = noteList.find((n) => n.id === selectedNoteId);
  const doneItem = contextMenuEl.querySelector('[data-action="done"]');
  doneItem.textContent = note && note.done ? 'undone' : 'done';

  contextMenuEl.style.left = `${x}px`;
  contextMenuEl.style.top = `${y}px`;
  contextMenuEl.classList.remove('hidden');
};

const hideContextMenu = () => {
  contextMenuEl.classList.add('hidden');
  selectedNoteId = null;
};

document.addEventListener('click', (e) => {
  if (!contextMenuEl.contains(e.target)) {
    hideContextMenu();
  }
});

contextMenuEl.querySelectorAll('.ctx-item').forEach((item) => {
  item.addEventListener('click', async () => {
    const action = item.dataset.action;
    if (!selectedNoteId) return;

    const noteList = await getNoteListProm();
    const note = noteList.find((n) => n.id === selectedNoteId);

    if (action === 'copy') {
      try {
        await navigator.clipboard.writeText(note.text);
        showToast('Copied');
      } catch (error) {
        showToast('Copy failed', TOAST_THEME_MAP.ERROR.label);
      }
    } else if (action === 'edit') {
      const el = noteListEl.querySelector(`[data-id="${selectedNoteId}"]`);
      if (el) startEdit(selectedNoteId, el);
    } else if (action === 'delete') {
      const id = selectedNoteId;
      const noteEl = noteListEl.querySelector(`[data-id="${selectedNoteId}"]`);
      hideContextMenu();
      showNoteConfirm(noteEl, 'Delete this note?', async () => {
        await deleteNote(id);
      });
    } else if (action === 'done') {
      const note = noteList.find((n) => n.id === selectedNoteId);
      const actionLabel = note && note.done ? 'undone' : 'done';
      item.textContent = actionLabel;
      await toggleDone(selectedNoteId);
    }
    hideContextMenu();
  });
});

const deleteNote = async (id) => {
  const noteList = await getNoteListProm();
  const filtered = noteList.filter((n) => n.id !== id);
  await setNoteList(filtered);
  await refreshNoteBoard();
};

const toggleDone = async (id) => {
  const noteList = await getNoteListProm();
  const note = noteList.find((n) => n.id === id);
  if (!note) return;
  note.done = !note.done;
  await setNoteList(noteList);
  await refreshNoteBoard();
};

const removeNoteEventListeners = (element) => {
  element.removeEventListener('click', onNoteClick);
  element.removeEventListener('contextmenu', onNoteContextmenu);
  element.removeEventListener('dblclick', onNoteDblclick);
};

const startEdit = async (id, element) => {
  const noteList = await getNoteListProm();
  const note = noteList.find((n) => n.id === id);
  if (!note) return;

  // Cancel any pending copy when starting edit
  if (pendingCopyId === id) {
    clearTimeout(pendingCopyTimer);
    pendingCopyId = null;
    pendingCopyTimer = null;
  }

  isEditingId = id;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = note.text;
  input.classList.add('edit-input');

  const finishEdit = async () => {
    // Cancel any pending copy when finishing edit
    if (pendingCopyId === id) {
      clearTimeout(pendingCopyTimer);
      pendingCopyId = null;
      pendingCopyTimer = null;
    }

    const newText = input.value.trim();
    if (newText && newText !== note.text) {
      note.text = newText;
      await setNoteList(noteList);
    }
    isEditingId = null;
    await refreshNoteBoard();
  };

  const cancelEdit = () => {
    isEditingId = null;
    refreshNoteBoard();
  };

  input.addEventListener('blur', finishEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  });

  element.replaceWith(input);
  removeNoteEventListeners(element);
  input.focus();
  input.select();
};

class Toast {
  static show(message, type = TOAST_THEME_MAP.SUCCESS.label, duration = 500) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    this.setTheme(toast, type);

    document.body.appendChild(toast);
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }

  static setTheme(toast, type) {
    toast.classList.add(TOAST_THEME_MAP[type.toUpperCase()].value);
  }
}

const showToast = (message, type, duration) => {
  Toast.show(message, type, duration);
};