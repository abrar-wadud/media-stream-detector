// content.js
(function () {
  const subtitleExtensions = ['.vtt', '.srt', '.sub', '.ass'];

  // Utility function to check if a URL is a subtitle
  const isSubtitle = (url) => subtitleExtensions.some((ext) => url.endsWith(ext));

  // Hook into fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    if (isSubtitle(args[0])) {
      console.log('Detected subtitle request via fetch:', args[0]);

      // Send the detected subtitle URL to the background script
      chrome.runtime.sendMessage({ type: 'subtitle', url: args[0] });
    }
    return response;
  };

  // Hook into XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (isSubtitle(url)) {
      console.log('Detected subtitle request via XHR:', url);

      // Send the detected subtitle URL to the background script
      chrome.runtime.sendMessage({ type: 'subtitle', url });
    }
    return originalXhrOpen.apply(this, [method, url, ...rest]);
  };
})();
