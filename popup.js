// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const m3u8List = document.getElementById('m3u8-list');
  const subtitleList = document.getElementById('subtitle-list');
  const clearButton = document.getElementById('clear');
  const copyAllM3u8Button = document.getElementById('copy-all-m3u8');
  const copyAllSubtitleButton = document.getElementById('copy-all-subtitles');

  // Utility to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

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

      // Add "Copy" button
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => copyToClipboard(url));
      li.appendChild(copyButton);

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

      // Add "Copy" button
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => copyToClipboard(url));
      li.appendChild(copyButton);

      subtitleList.appendChild(li);
    });
  });

  // "Copy All" for M3U8
  copyAllM3u8Button.addEventListener('click', () => {
    chrome.storage.local.get('m3u8Urls', (data) => {
      const urls = data.m3u8Urls || [];
      if (urls.length > 0) {
        copyToClipboard(urls.join('\n'));
      } else {
        alert('No M3U8 links to copy!');
      }
    });
  });

  // "Copy All" for Subtitles
  copyAllSubtitleButton.addEventListener('click', () => {
    chrome.storage.local.get('subtitleUrls', (data) => {
      const urls = data.subtitleUrls || [];
      if (urls.length > 0) {
        copyToClipboard(urls.join('\n'));
      } else {
        alert('No subtitle links to copy!');
      }
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
