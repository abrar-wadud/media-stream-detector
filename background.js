// background.js
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];
    const isSubtitleExtension = subtitleExtensions.some((ext) => details.url.endsWith(ext));

    // Check if the Content-Type is application/octet-stream
    const contentTypeHeader = details.responseHeaders.find(
      (header) => header.name.toLowerCase() === 'content-type'
    );

    const isSubtitleMimeType = contentTypeHeader && contentTypeHeader.value.includes('application/octet-stream');

    if (isSubtitleExtension || isSubtitleMimeType) {
      console.log('Detected subtitle request:', details.url);

      // Save the URL in storage
      chrome.storage.local.get('subtitleUrls', (data) => {
        const urls = data.subtitleUrls || [];
        if (!urls.includes(details.url)) {
          urls.push(details.url);
          chrome.storage.local.set({ subtitleUrls: urls });
        }
      });
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const isM3U8 = details.url.endsWith('.m3u8');
    if (isM3U8) {
      console.log('Detected M3U8 request:', details.url);

      // Save the URL in storage
      chrome.storage.local.get('m3u8Urls', (data) => {
        const urls = data.m3u8Urls || [];
        if (!urls.includes(details.url)) {
          urls.push(details.url);
          chrome.storage.local.set({ m3u8Urls: urls });
        }
      });
    }
  },
  { urls: ['<all_urls>'] }
);
