/* global chrome */
const YNAB = {
  apiUrl: 'https://api.youneedabudget.com/v1/budgets/'
}

export async function getRequest(endpoint, id) {
  const accessToken = await setAccessToken();
  const init = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  };
  const url = id.length > 0 ? YNAB.apiUrl + id + '/' : YNAB.apiUrl;
  return fetch(url + endpoint, init);
}

export async function postRequest(endpoint, id, data) {
  const accessToken = await setAccessToken();
  const body = JSON.stringify({
    budget_id: id,
    transaction: data
  });
  const init = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body
  }
  const url = id.length > 0 ? YNAB.apiUrl + id + '/' : YNAB.apiUrl;
  return fetch(url + endpoint, init);
}

async function setAccessToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['accessToken', 'refreshToken', 'expiresAt'], async (data) => {
      if (Date.now() >= data.expiresAt) {
        try {
          const message = {
            oauthUrl: process.env.REACT_APP_AUTHORIZATION_URL + 'oauth',
            clientId: process.env.REACT_APP_CLIENT_ID,
            refreshToken: data.refreshToken
          };
          chrome.runtime.sendMessage(message, (response) =>  {
            if (!response.accessToken) {
              reject(response.statusText);
            } else {
              resolve(response.accessToken);
            }
          });          
        } catch(error) {
          reject(error);
        }
      } else {
        resolve(data.accessToken);
      }
    });
  })
  .catch(error => { console.error(error) });
}