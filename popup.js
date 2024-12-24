document.addEventListener('DOMContentLoaded', () => {
  const lists = {
    m3u8: document.getElementById('m3u8-list'),
    subtitle: document.getElementById('subtitle-list')
  };
  const toast = document.getElementById('toast');
  
  const notify = msg => {
    toast.textContent = msg;
    toast.className = 'toast show';
    setTimeout(() => toast.className = 'toast', 2000);
  };

  const createLink = (url, list, type) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'url';
    span.title = url;
    span.textContent = url.split('/').pop();
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const copy = document.createElement('button');
    copy.innerHTML = '\uD83D\uDCC4';
    copy.title = 'Copy URL';
    copy.onclick = () => {
      navigator.clipboard.writeText(url)
        .then(() => notify('Copied'))
        .catch(() => notify('Copy failed'));
    };

    const remove = document.createElement('button');
    remove.innerHTML = '\uD83D\uDDD1';
    remove.title = 'Remove';
    remove.onclick = () => {
      browserAPI.storage.local.get(`${type}Urls`).then(data => {
        const urls = data[`${type}Urls`].filter(u => u !== url);
        browserAPI.storage.local.set({ [`${type}Urls`]: urls })
          .then(() => li.remove());
      });
    };

    actions.append(copy, remove);
    li.append(span, actions);
    list.appendChild(li);
  };

  // Theme toggle
  document.getElementById('theme-toggle').onclick = () => {
    const themeBtn = document.getElementById('theme-toggle');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.textContent = isDark ? '\uD83C\uDF1E' : '\uD83C\uDF1A';
    browserAPI.storage.local.set({ darkMode: !isDark });
  };

  // Monitor toggle
  const statusBtn = document.getElementById('status-toggle');
  const updateStatusButton = (isRunning) => {
    const icon = statusBtn.querySelector('.icon');
    const text = statusBtn.querySelector('.text');
    
    icon.textContent = isRunning ? '\u23F9' : '\u25B6';
    text.textContent = isRunning ? 'Stop' : 'Start';
    statusBtn.className = `monitor ${isRunning ? 'running' : 'stopped'}`;
  };

  statusBtn.onclick = () => {
    browserAPI.storage.local.get('isRunning').then(data => {
      const newStatus = !data.isRunning;
      browserAPI.storage.local.set({ isRunning: newStatus });
      updateStatusButton(newStatus);
      browserAPI.runtime.sendMessage({ type: 'toggleMonitoring', isRunning: newStatus });
    });
  };

  // Load saved URLs
  browserAPI.storage.local.get(['m3u8Urls', 'subtitleUrls', 'darkMode', 'isRunning'])
    .then(data => {
      if (data.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      updateStatusButton(data.isRunning);
      
      data.m3u8Urls?.forEach(url => createLink(url, lists.m3u8, 'm3u8'));
      data.subtitleUrls?.forEach(url => createLink(url, lists.subtitle, 'subtitle'));
    });

  // Clear all
  document.getElementById('clear').onclick = () => {
    browserAPI.storage.local.set({ m3u8Urls: [], subtitleUrls: [] }).then(() => {
      lists.m3u8.innerHTML = '';
      lists.subtitle.innerHTML = '';
      notify('Cleared');
    });
  };
});
