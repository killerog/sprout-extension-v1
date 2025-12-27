/* global chrome */
function renderLogin() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <main class="login">
      <img src="assets/logos/logo.svg" class="logo" alt="${CONFIG.APP_NAME} logo"></img>
      <p>${CONFIG.APP_NAME} allows you to quickly add a transaction to your budget without having to leave your current tab.</p>
      <p>To start using ${CONFIG.APP_NAME}, login with YNAB below.</p>
      <button id="login-btn">Login with YNAB</button>
      <small>By authorizing ${CONFIG.APP_NAME}, you are agreeing to our <a href="http://localhost:3000/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</small>
    </main>
    <div class="modal-container" id="login-modal">
      <aside class="login-window">
        <img src="assets/login-window.jpg" alt="YNAB log-in window"></img>
        <p>Please log into YNAB in the window that appears, select a budget and authorize ${CONFIG.APP_NAME} to continue.</p>
        <button id="reopen-btn">Reopen window</button>
      </aside>
    </div>
  `;

  const loginBtn = document.getElementById('login-btn');
  const reopenBtn = document.getElementById('reopen-btn');
  const modal = document.getElementById('login-modal');

  function authorize() {
    modal.classList.add('visible');
    loginBtn.disabled = true;
    reopenBtn.disabled = true;
    
    const message = {
      oauthUrl: CONFIG.AUTHORIZATION_URL + 'oauth',
      clientId: CONFIG.CLIENT_ID,
      extensionVersion: CONFIG.EXTENSION_VERSION
    };
    chrome.runtime.sendMessage(message);
    
    setTimeout(() => {
      loginBtn.disabled = false;
      reopenBtn.disabled = false;
    }, 5000);
  }

  loginBtn.addEventListener('click', authorize);
  reopenBtn.addEventListener('click', authorize);

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    const refreshTokenChange = changes.refreshToken;
    if (refreshTokenChange) {
      if (refreshTokenChange.oldValue !== refreshTokenChange.newValue) {
        modal.classList.remove('visible');
        router.navigate('/');
      }
    }
  });

  // Check if already logged in
  chrome.storage.local.get('refreshToken', (data) => {
    if (data.refreshToken) {
      modal.classList.remove('visible');
      router.navigate('/');
    }
  });
}

