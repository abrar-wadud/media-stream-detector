// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const m3u8List = document.getElementById('m3u8-list');
  const subtitleList = document.getElementById('subtitle-list');
  const clearButton = document.getElementById('clear');
  const themeToggle = document.getElementById('theme-toggle');

  // Utility to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - 20);
    return `${start}...${end}`;
  };

  const createLinkElement = (url, list, storageKey) => {
    const li = document.createElement('li');
    
    const link = document.createElement('a');
    link.href = url;
    link.textContent = truncateUrl(url);
    link.title = url; // Show full URL on hover
    link.target = '_blank';
    li.appendChild(link);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyToClipboard(url)); // Use full URL for copying

    const removeButton = document.createElement('button');
    removeButton.textContent = '✕';
    removeButton.addEventListener('click', () => {
      chrome.storage.local.get(storageKey, (data) => {
        const urls = data[storageKey].filter(u => u !== url);
        chrome.storage.local.set({ [storageKey]: urls }, () => {
          li.remove();
        });
      });
    });

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(removeButton);
    li.appendChild(buttonGroup);
    list.appendChild(li);
  };

  // Load theme preference
  chrome.storage.local.get('darkMode', (data) => {
    if (data.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    chrome.storage.local.set({ darkMode: !isDark });
  });

  // Load and display saved URLs
  chrome.storage.local.get(['m3u8Urls', 'subtitleUrls'], (data) => {
    (data.m3u8Urls || []).forEach(url => {
      createLinkElement(url, m3u8List, 'm3u8Urls');
    });
    
    (data.subtitleUrls || []).forEach(url => {
      createLinkElement(url, subtitleList, 'subtitleUrls');
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
