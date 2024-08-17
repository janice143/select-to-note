const titleEl = document.querySelector('#title');
const noteListEl = document.querySelector('#noteList');
const clsBtnEl = document.querySelector('.clear');
const cpBtnEl = document.querySelector('.copy');

const TOAST_THEME_MAP = {
  SUCCESS: {
    label: 'success',
    value: 'toast-success'
  },
  WARNING: {
    label: 'warning',
    value: 'toast-warning'
  },
  ERROR: {
    label: 'error',
    value: 'toast-error'
  }
};

/**
 * Load the note list on DOMContentLoaded event
 */
document.addEventListener('DOMContentLoaded', () => {
  addNoteToBoard();
});

/**
 * Clear the note list
 */
clsBtnEl.addEventListener('click', async () => {
  try {
    await initNoteList();
    showToast('Cleared successfully');
  } catch (error) {
    showToast('Failed to clear', TOAST_THEME_MAP.ERROR.label);
  }
});

/**
 * Copy all notes to clipboard
 */
cpBtnEl.addEventListener('click', async () => {
  try {
    const flag = await copyToClipboard();
    flag
      ? showToast('Copied successfully')
      : showToast('No content to copy', TOAST_THEME_MAP.WARNING.label);
  } catch (error) {
    showToast('Failed to copy', TOAST_THEME_MAP.ERROR.label);
  }
});

/**
 * Get the note list from chrome.storage.sync
 */
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

/**
 * Initialize the note list as an empty array
 */
const initNoteList = async () => {
  try {
    await chrome.storage.sync.set({ noteList: [] });
    showEmpty();
  } catch (error) {
    console.error('Error initializing note list:', error);
    throw error;
  }
};

/**
 * Add notes to the board by creating and appending elements to the DOM
 */
const addNoteToBoard = async () => {
  const noteList = await getNoteListProm();

  if (!noteList.length) return showEmpty();

  const fragment = document.createDocumentFragment(); // Create a document fragment

  noteList.forEach((note, index) => {
    const noteElement = document.createElement('p');
    noteElement.textContent = `${index + 1}. ${note}`;
    fragment.appendChild(noteElement); // Add each note to the fragment
  });

  noteListEl.appendChild(fragment); // Append the fragment to the DOM
};

/**
 * Display a message when no notes are present
 */
const showEmpty = () => {
  noteListEl.innerHTML = 'Nothing here yet~';
};

/**
 * Copy all notes to clipboard
 */
const copyToClipboard = async () => {
  const noteList = await getNoteListProm();
  if (!noteList.length) return false;

  const textToCopy = noteList.join('\n');

  try {
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Toast handling class to show notifications
 */
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

// Replace showToast function calls with the Toast class
const showToast = (message, type, duration) => {
  Toast.show(message, type, duration);
};
