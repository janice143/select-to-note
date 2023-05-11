// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "addNote") {
//     console.log(222, request.selection);
//     // 获取当前页面的URL和标题
//     const url = window.location.href;
//     const title = document.title;

//     // 获取选中的文本
//     const selection = request.selection;

//     // 创建一个新的笔记对象
//     const note = {
//       url: url,
//       title: title,
//       selection: selection,
//       timestamp: new Date().getTime(),
//     };

//     // 将笔记对象发送到扩展程序的后台脚本，以便保存到Note Board中
//     // chrome.runtime.sendMessage({ action: "saveNote", note: note });
//   }
// });
