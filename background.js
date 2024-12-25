// background.js
var browser = browser || chrome;

// Add state management
let isMonitoring = false;

browserAPI.runtime.onMessage.addListener((message) => {
  if (message.type === 'toggleMonitoring') {
    isMonitoring = message.isRunning;
  }
});

browserAPI.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (!isMonitoring) return;

    const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];
    const isSubtitle = subtitleExtensions.some((ext) => details.url.includes(ext));
    const m3u8Extensions = ['master.txt', 'master.m3u8']
    const isM3U8 = m3u8Extensions.some((ext) => details.url.includes(ext));

    if (isM3U8 || isSubtitle) {
      console.log('Detected media request:', details.url);

      // Save the URL in storage
      const storageKey = isM3U8 ? 'm3u8Urls' : 'subtitleUrls';
      browserAPI.storage.local.get(storageKey).then((data) => {
        const urls = data[storageKey] || [];
        if (!urls.includes(details.url)) {
          urls.push(details.url);
          browserAPI.storage.local.set({ [storageKey]: urls });
        }
      });
    }
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

// Also listen for completed requests to catch cached responses
browserAPI.webRequest.onCompleted.addListener(
  function (details) {
    if (!isMonitoring) return;

    const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];
    const isSubtitle = subtitleExtensions.some((ext) => details.url.endsWith(ext));
    
    if (isSubtitle) {
      console.log('Detected completed subtitle request:', details.url, 'FromCache:', details.fromCache);
      
      browserAPI.storage.local.get('subtitleUrls').then((data) => {
        const urls = data.subtitleUrls || [];
        if (!urls.includes(details.url)) {
          urls.push(details.url);
          browserAPI.storage.local.set({ subtitleUrls: urls });
        }
      });
    }
  },
  { urls: ['<all_urls>'] }
);

browserAPI.runtime.onInstalled.addListener(function() {
  // Initialize storage with running state
  browserAPI.storage.local.set({
    m3u8Urls: [],
    subtitleUrls: [],
    darkMode: false,
    isRunning: false
  });
});
