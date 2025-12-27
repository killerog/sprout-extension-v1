/* global chrome */
// Main app entry point
const router = new Router();
window.router = router; // Make router globally available

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.connect({ name: 'popup' });
  
  // Set theme
  chrome.storage.local.get(data => {
    if (data['setting-theme']) {
      document.body.className = data['setting-theme'] === 'dark' ? 'dark-theme' : 'light-theme';
    }
    
    // Check for login
    if (!data.refreshToken) {
      router.navigate('login');
    } else {
      // Check for updated Privacy Policy
      const privacyInit = {
        method: 'GET',
        mode: 'cors'
      };
      const privacyUrl = CONFIG.AUTHORIZATION_URL + 'privacy';
      fetch(privacyUrl, privacyInit).then(res => res.json()).then(json => {
        if (json) {
          const privacyPolicyUpdated = json.lastUpdated > (data['privacy-agree-date'] || 0);
          if (privacyPolicyUpdated) {
            // Show privacy policy modal (simplified for now)
            console.log('Privacy policy updated');
          }
        }
      });
      
      // Check for extension update
      if (data['last-extension-version'] !== CONFIG.EXTENSION_VERSION) {
        chrome.storage.local.set({ 'last-extension-version': CONFIG.EXTENSION_VERSION }, () => {
          // Show update notice (simplified for now)
          console.log('Extension updated to', CONFIG.EXTENSION_VERSION);
        });
      }
      
      // Clear cache if expired or new cache version
      const cacheVersion = parseFloat(CONFIG.CACHE_VERSION);
      if (!data['cache-version'] || data['cache-version'] !== cacheVersion || Date.now() >= (data['cache-expiry'] || 0)) {
        resetCache(data);
      } else {
        router.start();
      }
    }
  });
});

function resetCache(settings) {
  let cachedKeys = [];
  for (let key of Object.keys(settings)) {
    if (key.startsWith('cache-')) {
      cachedKeys.push(key);
    }
  }
  chrome.storage.local.remove(cachedKeys, () => {
    chrome.storage.local.set({ 'cache-version': parseFloat(CONFIG.CACHE_VERSION) }, () => {
      router.start();
    });
  });
}

// Register routes
router.register('/', renderBudget);
router.register('/login', renderLogin);
router.register('/:id', (id) => renderMain(id));

