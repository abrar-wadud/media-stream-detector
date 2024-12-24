// content.js
(function () {
  let isMonitoring = false;
  const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];

  // Check initial state
  browserAPI.storage.local.get('isRunning').then((data) => {
    isMonitoring = data.isRunning;
  });

  // Update message sending
  const sendMessage = (message) => {
    try {
      browserAPI.runtime.sendMessage(message).catch(() => {});
    } catch (e) {
      console.warn('Failed to send message:', e);
    }
  };

  // Listen for state changes through storage
  browserAPI.storage.onChanged?.addListener((changes) => {
    if (changes.isRunning) {
      isMonitoring = changes.isRunning.newValue;
    }
  });

  // Utility function to check if a URL is a subtitle
  const isSubtitle = (url) => subtitleExtensions.some((ext) => url.endsWith(ext));

  // Create a performance observer to catch resource timing entries
  const observer = new PerformanceObserver((list) => {
    if (!isMonitoring) return;
    for (const entry of list.getEntries()) {
      if (isSubtitle(entry.name)) {
        console.log('Detected subtitle via PerformanceObserver:', entry.name);
        sendMessage({ 
          type: 'subtitle', 
          url: entry.name,
          fromCache: entry.transferSize === 0
        });
      }
    }
  });

  // Start observing resource timing entries
  observer.observe({ entryTypes: ['resource'] });

  // Hook into fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    if (isMonitoring && isSubtitle(args[0])) {
      console.log('Detected subtitle request via fetch:', args[0]);
      sendMessage({ 
        type: 'subtitle', 
        url: args[0],
        fromCache: response.headers.get('x-cache') !== null
      });
    }
    return response;
  };

  // Hook into XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (isMonitoring && isSubtitle(url)) {
      console.log('Detected subtitle request via XHR:', url);
      
      // Add load event listener to check cache status
      this.addEventListener('load', function() {
        const fromCache = this.getResponseHeader('x-cache') !== null;
        sendMessage({ 
          type: 'subtitle', 
          url,
          fromCache
        });
      });
    }
    return originalXhrOpen.apply(this, [method, url, ...rest]);
  };
})();