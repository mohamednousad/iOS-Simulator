// Open the simulator full-page in a new tab when the toolbar icon is clicked.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("simulator.html") });
});
