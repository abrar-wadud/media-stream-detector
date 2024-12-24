const browserAPI = (function() {
  const api = {};
  const browserType = typeof browser !== 'undefined' ? 'firefox' : 'chrome';
  const b = browserType === 'firefox' ? browser : chrome;

  api.storage = {
    local: {
      get: (keys) => new Promise((resolve) => b.storage.local.get(keys, resolve)),
      set: (items) => new Promise((resolve) => b.storage.local.set(items, resolve))
    }
  };

  api.runtime = {
    sendMessage: (message) => new Promise((resolve) => b.runtime.sendMessage(message, resolve)),
    onMessage: {
      addListener: (callback) => b.runtime.onMessage.addListener(callback)
    },
    onInstalled: {
      addListener: (callback) => b.runtime.onInstalled.addListener(callback)
    }
  };

  api.webRequest = {
    onBeforeRequest: {
      addListener: (callback, filter, opt) => b.webRequest.onBeforeRequest.addListener(callback, filter, opt)
    },
    onCompleted: {
      addListener: (callback, filter) => b.webRequest.onCompleted.addListener(callback, filter)
    }
  };

  return api;
})();
