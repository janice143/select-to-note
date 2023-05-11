// 用于创建右键菜单和响应用户的操作
chrome.runtime.onInstalled.addListener(() => {
  initNodeList();
  chrome.contextMenus.create({
    id: "note-extension",
    title: "Add to Note Board",
    contexts: ["selection"],
  });
});

// 监听菜单项点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "note-extension") {
    addNote(info.selectionText);
  }
});

// add notes to noteList
const addNote = async (value) => {
  const res = await getNoteListProm();
  const { noteList = [] } = res;
  noteList.push(value);

  chrome.storage.sync.set({ noteList }, () => {
    console.log("当前存入的单词为" + value);
    console.log("当前单词列表为", noteList);
  });
};

const getNoteListProm = async () => {
  return await chrome.storage.sync.get();
};

const initNodeList = () => {
  chrome.storage.sync.set({ noteList: [] });
};
