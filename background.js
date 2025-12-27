/* global chrome */

const YNAB = {
  apiUrl: 'https://app.youneedabudget.com/oauth/authorize',
  redirectUri: chrome.identity.getRedirectURL(),
  responseType: 'code'
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.refreshToken) {
      getTokens(message.oauthUrl, message.clientId, null, message.refreshToken, sendResponse);
    } else {
      authorize(message.oauthUrl, message.clientId, message.extensionVersion);
    }
  } catch (error) {
    throw Error(error);
  }
  return true;
});

// on extension close
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(function() {
      chrome.storage.local.get((settings) => {
        if (!settings['setting-cache'] || Date.now() >= settings['cache-expiry']) {
          let cachedKeys = []
          for (let key of Object.keys(settings)) {
            if (key.startsWith('cache-')) {
              cachedKeys.push(key);
            }
          }
          chrome.storage.local.remove(cachedKeys);
        }
        if (settings['setting-cache'] && !settings['cache-expiry']) {
          chrome.storage.local.set({ 'cache-expiry': (settings['setting-cache'] * 3600000) + Date.now() });
        }
        if (!settings['setting-last-budget']) {
          chrome.storage.local.remove(['budgetId', 'budgetName']);
        }
      })
    });
  }
});

async function authorize(oauthUrl, clientId, extensionVersion) {
  const state = await generateState();
  const authorizeParams = new URLSearchParams();
  authorizeParams.append('client_id', clientId);
  authorizeParams.append('redirect_uri', YNAB.redirectUri);
  authorizeParams.append('response_type', YNAB.responseType);
  authorizeParams.append('state', state);
  const url = YNAB.apiUrl + '?' + authorizeParams.toString();

  chrome.identity.launchWebAuthFlow({
    url,
    interactive: true
  }, (response) => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
      throw Error(error.message);
    } else {
      const responseParams = new URL(response).search;
      const oauthParams = new URLSearchParams(responseParams);
      if (oauthParams.get('state') === state) {
        oauthParams.delete('state');
        chrome.storage.local.set({
          'privacy-agree-date': Date.now(),
          'last-extension-version': extensionVersion
        }, () => getTokens(oauthUrl, clientId, oauthParams));
      } else {
        console.error('invalid state');
      }
    }
  });
}

function getTokens(oauthUrl, clientId, params, refreshToken = null, responseCallback = null) {
  if (!params) {
    params = new URLSearchParams();
  }
  params.append('client_id', clientId);
  params.append('grant_type', refreshToken ? 'refresh_token' : 'authorization_code');
  if (refreshToken) {
    params.append('refresh_token', refreshToken);
  } else {
    params.append('redirect_uri', YNAB.redirectUri);
  }
  const init = {
    method: 'POST',
    body: params,
    mode: 'cors'
  };

  fetch(oauthUrl, init)
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({
        expiresAt: data.expiresAt,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
      if (responseCallback) {
        responseCallback({accessToken: data.accessToken});
      }
    })
    .catch(error => { 
      console.error(error);
      if (responseCallback) {
        responseCallback({ 
          ok: false,
          statusText: error.message ? error.message : ''
        });
      }
    });
}

async function generateState() {
  const randomNum = crypto.getRandomValues(new Uint32Array(1))[0];
  const msgBuffer = new TextEncoder('utf-8').encode(randomNum.toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}
