// content.js
(function () {
  const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];

  // Utility function to check if a URL is a subtitle
  const isSubtitle = (url) => subtitleExtensions.some((ext) => url.endsWith(ext));

  // Create a performance observer to catch resource timing entries
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (isSubtitle(entry.name)) {
        console.log('Detected subtitle via PerformanceObserver:', entry.name);
        chrome.runtime.sendMessage({ 
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
    if (isSubtitle(args[0])) {
      console.log('Detected subtitle request via fetch:', args[0]);
      chrome.runtime.sendMessage({ 
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
    if (isSubtitle(url)) {
      console.log('Detected subtitle request via XHR:', url);
      
      // Add load event listener to check cache status
      this.addEventListener('load', function() {
        const fromCache = this.getResponseHeader('x-cache') !== null;
        chrome.runtime.sendMessage({ 
          type: 'subtitle', 
          url,
          fromCache
        });
      });
    }
    return originalXhrOpen.apply(this, [method, url, ...rest]);
  };
})();