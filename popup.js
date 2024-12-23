// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const m3u8List = document.getElementById('m3u8-list');
  const subtitleList = document.getElementById('subtitle-list');
  const clearButton = document.getElementById('clear');

  // Load and display saved M3U8 URLs
  chrome.storage.local.get('m3u8Urls', (data) => {
    const urls = data.m3u8Urls || [];
    urls.forEach((url) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      li.appendChild(link);
      m3u8List.appendChild(li);
    });
  });

  // Load and display saved Subtitle URLs
  chrome.storage.local.get('subtitleUrls', (data) => {
    const urls = data.subtitleUrls || [];
    urls.forEach((url) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      li.appendChild(link);
      subtitleList.appendChild(li);
    });
  });

  // Clear stored URLs
  clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ m3u8Urls: [], subtitleUrls: [] }, () => {
      m3u8List.innerHTML = '';
      subtitleList.innerHTML = '';
    });
  });
});
