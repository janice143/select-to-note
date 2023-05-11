const titleEl = document.querySelector("#title");
const noteListEl = document.querySelector("#noteList");
const clsBtnEl = document.querySelector(".clear");
const cpBtnEl = document.querySelector(".copy");

const TOAST_THEME_MAP = {
  SUCCESS: {
    label: "success",
    value: "toast-success",
  },
  WARNING: {
    label: "warning",
    value: "toast-warning",
  },
  ERROR: {
    label: "error",
    value: "toast-error",
  },
};

/**
 * 加载
 */
document.addEventListener("DOMContentLoaded", () => {
  addNoteToBoard();
});

/**
 * 清空
 */
clsBtnEl.addEventListener("click", async () => {
  initNodeList();
  showToast("清空成功");
});

/**
 * 一键复制
 */
cpBtnEl.addEventListener("click", async () => {
  const flag = await copyToClipboard();
  flag
    ? showToast("复制成功")
    : showToast("无内容可复制", TOAST_THEME_MAP.WARNING.label);
});

const getNoteListProm = async () => {
  const res = await chrome.storage.sync.get();
  const { noteList } = res;
  return noteList;
};

const initNodeList = () => {
  chrome.storage.sync.set({ noteList: [] });
  showEmpty();
};

const addNoteToBoard = async () => {
  const noteList = await getNoteListProm();

  if (!noteList.length) return showEmpty();

  noteList.forEach((note, index) => {
    const noteElement = document.createElement("p");
    noteElement.textContent = `${index + 1}. ${note}`;
    noteListEl.appendChild(noteElement);
  });
};

const showEmpty = () => {
  noteListEl.innerHTML = "什么都没有~";
};

const copyToClipboard = async () => {
  const nodeList = await getNoteListProm();
  if (!nodeList.length) return false;

  const textToCopy = nodeList.join("\n");

  // const tempInput = document.createElement("input"); // 创建临时输入框
  // tempInput.value = textToCopy; // 将文本赋值给临时输入框
  // document.body.appendChild(tempInput); // 将临时输入框添加到文档中
  // tempInput.select(); // 选中临时输入框中的文本
  // document.execCommand("copy"); // 将选定文本复制到剪贴板
  // document.body.removeChild(tempInput); // 从文档中删除临时输入框

  //  EI不兼容
  await navigator.clipboard.writeText(textToCopy);
  return true;
};

const showToast = (
  message,
  type = TOAST_THEME_MAP.SUCCESS.label,
  duration = 500
) => {
  // 创建 Toast 元素
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  setToastTheme(toast, type);
  // 将 Toast 元素添加到文档中
  document.body.appendChild(toast);

  // 显示 Toast 元素
  toast.classList.add("show");

  // 隐藏 Toast 元素
  setTimeout(() => {
    toast.classList.remove("show");
    // 删除 Toast 元素
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};

const setToastTheme = (toast, type) => {
  switch (type) {
    case TOAST_THEME_MAP.SUCCESS.label:
      toast.classList.add(TOAST_THEME_MAP.SUCCESS.value);
      break;
    case TOAST_THEME_MAP.ERROR.label:
      toast.classList.add(TOAST_THEME_MAP.ERROR.value);
      break;
    case TOAST_THEME_MAP.WARNING.label:
      toast.classList.add(TOAST_THEME_MAP.WARNING.value);
      break;
    default:
      break;
  }
};
