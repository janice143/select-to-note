// This function sets up the context menus and initializes the note list when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  initNoteList(); // Initialize the note list

  try {
    // Create a context menu item for adding selected text to the note board
    chrome.contextMenus.create(
      {
        id: 'note-extension',
        title: 'Add to Note Board',
        contexts: ['selection']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error creating note-extension menu:',
            chrome.runtime.lastError
          );
        } else {
          console.log('note-extension menu created successfully');
        }
      }
    );

    // Create a context menu item for adding the current page URL to the note board
    chrome.contextMenus.create(
      {
        id: 'add-page-url',
        title: 'Add Page URL to Note Board',
        contexts: ['page']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error creating add-page-url menu:',
            chrome.runtime.lastError
          );
        } else {
          console.log('add-page-url menu created successfully');
        }
      }
    );
  } catch (e) {
    console.error('Error in contextMenus.create:', e);
  }
});

// Listen for clicks on context menu items
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // If the 'note-extension' menu item is clicked, add the selected text to the note board
  if (info.menuItemId === 'note-extension') {
    addNoteToBoard(info.selectionText);
  }
  // If the 'add-page-url' menu item is clicked, add the current page's title and URL to the note board
  else if (info.menuItemId === 'add-page-url') {
    const note = `${tab.title}: ${tab.url}`;
    addNoteToBoard(note);
  }
});

// Add a note to the note list and save it to chrome.storage.sync
const addNoteToBoard = async (value) => {
  try {
    const { noteList = [] } = await getNoteListProm(); // Get the current note list from storage
    noteList.push(value); // Add the new note to the list

    // Save the updated note list back to storage
    chrome.storage.sync.set({ noteList }, () => {
      console.log('Stored note:', value);
      console.log('Current note list:', noteList);
    });
  } catch (error) {
    console.error('Error adding note:', error); // Log any errors that occur
  }
};

// Retrieve the note list from chrome.storage.sync
const getNoteListProm = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('noteList', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError); // Reject the promise if there is an error
      } else {
        resolve(result); // Resolve the promise with the retrieved data
      }
    });
  });
};

// Initialize the note list in chrome.storage.sync if it doesn't already exist
const initNoteList = async () => {
  try {
    const { noteList } = await getNoteListProm(); // Get the current note list from storage
    if (!noteList) {
      // If the note list doesn't exist, initialize it as an empty array
      chrome.storage.sync.set({ noteList: [] }, () => {
        console.log('Initialized noteList');
      });
    }
  } catch (error) {
    console.error('Error initializing noteList:', error); // Log any errors that occur
  }
};
