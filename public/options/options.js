/* global chrome */

const SETTINGS = {
    balance: 'setting-balance',
    theme: 'setting-theme',
    save: 'setting-last-budget',
    cache: 'setting-cache',
    balanceDefault: 'show-all',
    themeDefault: 'system',
    saveDefault: 'false',
    cacheDefault: 0
}

document.getElementById('balance-select').addEventListener('change', (event) => {
    const balance = event.target.value;
    if (balance === SETTINGS.balanceDefault) {
        chrome.storage.local.remove(SETTINGS.balance);
    } else {
        chrome.storage.local.set({ [SETTINGS.balance]: event.target.value });
    }
});

document.getElementById('theme-select').addEventListener('change', (event) => {
    const theme = event.target.value;
    if (theme === SETTINGS.themeDefault) {
        chrome.storage.local.remove(SETTINGS.theme);
    } else {
        chrome.storage.local.set({ [SETTINGS.theme]: event.target.value });
    }
});

document.getElementById('last-budget-select').addEventListener('change', (event) => {
    const save = event.target.value;
    if (save === SETTINGS.saveDefault) {
        chrome.storage.local.remove(['budgetId', 'budgetName', SETTINGS.save]);
    } else {
        chrome.storage.local.set({ [SETTINGS.save]: true });
    }
});

document.getElementById('cache-length').addEventListener('change', (event) => {
    const cacheLength = parseFloat(event.target.value);
    if (cacheLength === SETTINGS.cacheDefault) {
        chrome.storage.local.get((settings) => {
            let cachedKeys = []
            for (let key of Object.keys(settings)) {
                if (key.startsWith('cache-') || key.startsWith('budget')) {
                    cachedKeys.push(key);
                }
            }
            cachedKeys.push(SETTINGS.cache);
            chrome.storage.local.remove(cachedKeys);
        })
    } else {
        chrome.storage.local.set({ [SETTINGS.cache]: cacheLength });
    }
});

document.getElementById('data-clear').onclick = function() {
    chrome.storage.local.get((settings) => {
        let cachedKeys = []
        for (let key of Object.keys(settings)) {
            if (key.startsWith('cache-') || key.startsWith('budget')) {
                cachedKeys.push(key);
            }
        }
        chrome.storage.local.remove(cachedKeys, () => {
            document.getElementById('data-clear').disabled = true;
            document.getElementById('data-clear').innerText = 'Data cleared!';
        });
    })
}

document.getElementById('logout').onclick = function() {
    chrome.storage.local.clear(() => {
        document.getElementById('settings').classList = 'hidden';
        document.getElementById('logged-out').classList = 'visible';
    });
}

window.onload = function() {
    chrome.storage.local.get((data) => {
        const keys = Object.keys(data);
        if (keys.length === 0) {
            document.getElementById('settings').classList = 'hidden';
        } else {
            document.getElementById('theme-select').value = data[SETTINGS.theme] ? data[SETTINGS.theme] : SETTINGS.themeDefault;
            document.getElementById('last-budget-select').value = data[SETTINGS.save] ? data[SETTINGS.save] : SETTINGS.saveDefault;
            document.getElementById('cache-length').value = data[SETTINGS.cache] ? data[SETTINGS.cache] : SETTINGS.cacheDefault;
            document.getElementById('balance-select').value = data[SETTINGS.balance] ? data[SETTINGS.balance] : SETTINGS.balanceDefault;
        }
    });
}