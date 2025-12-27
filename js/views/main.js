/* global chrome */
let mainState = {
  accounts: [],
  payees: [],
  categories: [],
  closedAccounts: [],
  budgetName: '',
  currencyFormat: null,
  transactionAmount: 0,
  transactionAmountInflow: false,
  transactionAccountId: null,
  transactionAccountName: '',
  transactionAccountIsTracking: false,
  transactionPayeeId: null,
  transactionPayeeName: '',
  transactionPayeeIsTransfer: false,
  transactionCategoryId: null,
  transactionCategoryName: '',
  transactionMemo: null,
  transactionDate: null,
  transactionFlag: null,
  transactionCleared: false,
  loading: true,
  saving: false,
  error: null,
  localDate: '',
  showBudgetSwitch: null,
  showAccountBalance: null,
  showCategoryBalance: null
};

let amountComponent, accountComponent, payeeComponent, categoryComponent, flagComponent;
let memoInput, dateInput, clearBtn, submitBtn;

function setLocalDate() {
  const offset = (new Date()).getTimezoneOffset() * 60000;
  const localDate = (new Date(Date.now() - offset)).toISOString().split('T')[0];
  mainState.localDate = localDate;
  mainState.transactionDate = localDate;
  if (dateInput) dateInput.value = localDate;
}

function isLoading() {
  return !(mainState.accounts.length > 0 &&
    mainState.payees.length > 0 &&
    mainState.categories.length > 0 &&
    mainState.currencyFormat !== null);
}

function setSettings(settings) {
  mainState.currencyFormat = settings.currency_format;
  setLocalDate();
  if (dateInput) dateInput.value = mainState.transactionDate;
  getData('accounts');
  getData('categories');
}

function setAccounts(accounts) {
  let budgetAccounts = {name: 'Budget Accounts', accounts: []};
  let trackingAccounts = {name: 'Tracking Accounts', accounts: []};
  let closedAccountsIds = [];
  for (let account of accounts) {
    if (!(account.closed || account.deleted)) {
      account.on_budget ? budgetAccounts.accounts.push(account) : trackingAccounts.accounts.push(account);
    } else {
      closedAccountsIds.push(account.id);
    }
  }
  mainState.accounts = [budgetAccounts, trackingAccounts];
  mainState.closedAccounts = closedAccountsIds;
  getData('payees');
}

function setPayees(payees) {
  const START = 'Starting Balance';
  const MANUAL = 'Manual Balance Adjustment';
  const RECONCILIATION = 'Reconciliation Balance Adjustment';
  let savedPayees = {name: 'Saved Payees', payees: []};
  let transferPayees = {name: 'Payments and Transfers', payees: []};
  for (let payee of payees) {
    let name = payee.name;
    if (!(name === START || name === MANUAL || name === RECONCILIATION)) {
      if (payee.transfer_account_id) {
        if (mainState.closedAccounts.indexOf(payee.transfer_account_id) === -1) {
          transferPayees.payees.push(payee);
        }
      } else {
        savedPayees.payees.push(payee);
      }
    }
  }
  savedPayees.payees = savedPayees.payees.sort((a, b) => {
    let payeeA = a.name.toUpperCase();
    let payeeB = b.name.toUpperCase();
    if (payeeA < payeeB) return -1;
    if (payeeA > payeeB) return 1;
    return 0;
  });
  transferPayees.payees = transferPayees.payees.sort((a, b) => {
    let payeeA = a.name.toUpperCase();
    let payeeB = b.name.toUpperCase();
    if (payeeA < payeeB) return -1;
    if (payeeA > payeeB) return 1;
    return 0;
  });
  mainState.payees = [savedPayees, transferPayees];
  mainState.loading = isLoading();
  updateUI();
}

function setCategories(categoryGroups) {
  let inflowFound = false;
  let creditCardFound = false;
  let index = 0;
  const INFLOW_NAME = 'Inflow';
  while ((!inflowFound && !creditCardFound) || index < categoryGroups.length) {
    if (categoryGroups[index].name === 'Internal Master Category') {
      categoryGroups[index].name = INFLOW_NAME;
      let inflowIndex = 0;
      while (inflowIndex < categoryGroups[index].categories.length) {
        const inflowCategory = categoryGroups[index].categories;
        if (!inflowCategory[inflowIndex].name.includes('Inflow:')) {
          inflowCategory.splice(inflowIndex, 1);
        } else {
          inflowCategory[inflowIndex].name = 'Ready to Assign';
          inflowIndex++;
        }
      }
      inflowFound = true;
      index++;
    } else if (categoryGroups[index].name === 'Credit Card Payments') {
      categoryGroups.splice(index, 1);
    } else {
      index++;
    }
  }
  let sortedCategories = categoryGroups.sort((a, b) => {
    let categoryGroupA = a.name.toUpperCase();
    let categoryGroupB = b.name.toUpperCase();
    const internal = INFLOW_NAME.toUpperCase();
    if (categoryGroupA === internal) {
      return -1;
    } else if (categoryGroupB === internal) {
      return 1;
    }
    return 0;
  });
  mainState.categories = sortedCategories;
  mainState.loading = isLoading();
  updateUI();
}

function getData(endpoint) {
  const cacheName = 'cache-' + endpoint + '-' + budgetId;
  chrome.storage.local.get(data => {
    if (data[cacheName]) {
      if (endpoint === 'settings') {
        setSettings(data[cacheName]);
      } else if (endpoint === 'accounts') {
        setAccounts(data[cacheName]);
      } else if (endpoint === 'payees') {
        setPayees(data[cacheName]);
      } else if (endpoint === 'categories') {
        setCategories(data[cacheName]);
      }
    } else {
      getRequest(endpoint, budgetId).then(response => response.json())
        .then(json => {
          if (json.error) {
            if (json.error.id === '404.2') {
              chrome.storage.local.remove(['budgetId', 'budgetName'], () => router.navigate('/'));
            } else {
              mainState.error = json.error;
              updateUI();
            }
          } else {
            if (endpoint === 'settings') {
              if (data['setting-cache']) {
                chrome.storage.local.set({ [cacheName]: json.data.settings });
              }
              setSettings(json.data.settings);
            } else if (endpoint === 'accounts') {
              if (data['setting-cache']) {
                chrome.storage.local.set({ [cacheName]: json.data.accounts });
              }
              setAccounts(json.data.accounts);
            } else if (endpoint === 'payees') {
              if (data['setting-cache']) {
                chrome.storage.local.set({ [cacheName]: json.data.payees });
              }
              setPayees(json.data.payees);
            } else if (endpoint === 'categories') {
              if (data['setting-cache']) {
                chrome.storage.local.set({ [cacheName]: json.data.category_groups });
              }
              setCategories(json.data.category_groups);
            }
          }
        });
    }      
  });
}

let budgetId = '';

function renderMain(id) {
  budgetId = id;
  const root = document.getElementById('root');
  
  if (id === 'index.html') {
    router.navigate('/');
    return;
  }

  chrome.storage.local.get(data => {
    if (!data.refreshToken) {
      router.navigate('login');
    } else if (!data.budgetName) {
      router.navigate('/');
    } else {
      mainState.budgetName = data.budgetName;
      mainState.showBudgetSwitch = data.budgetMultiple;
      mainState.showAccountBalance = !data['setting-balance'] || data['setting-balance'] === 'show-account';
      mainState.showCategoryBalance = !data['setting-balance'] || data['setting-balance'] === 'show-category';
      mainState.loading = true;
      mainState.error = null;
      renderUI();
      getData('settings');
    }
  });
}

function renderUI() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <main class="main-view">
      <header>
        <h1>${mainState.budgetName}</h1>
        <section>
          ${mainState.showBudgetSwitch ? `
            <button title="Switch budget" class="budget-switcher icon" id="budget-switcher">
              <img src="assets/icons/folder-open.svg" alt="Open budget"></img>
            </button>
          ` : ''}
          <button title="Settings" class="settings icon" id="settings-btn">
            <img src="assets/icons/cog.svg" alt="Open settings"></img>
          </button>
        </section>
      </header>
      <div id="amount-container"></div>
      <h2>Account</h2>
      <div id="account-container"></div>
      <h2>Payee</h2>
      <div id="payee-container"></div>
      <h2>Category</h2>
      <div id="category-container"></div>
      <h2>Memo</h2>
      <input data-testid="memo" id="memo-input" maxLength="200"></input>
      <div class="bottom-row">
        <div>
          <h2>Date</h2>
          <input data-testid="transaction-date" id="date-input" type="date" max="${mainState.localDate}"></input>
        </div>
        <div>
          <h2>Flag</h2>
          <div id="flag-container"></div>
        </div>
        <div>
          <h2>Clear</h2>
          <div class="content-row">
            <button title="Clear" class="icon" id="clear-btn">
              <img src="assets/icons/unclear-light.svg" alt="Transaction not cleared" class="no-invert"></img>
            </button>
          </div>
        </div>
      </div>
      <button class="submit" id="submit-btn" disabled>Save Transaction</button>
    </main>
    <div class="loader" id="loading-loader">
      <div class="message"></div>
    </div>
    <div class="loader" id="saving-loader">
      <div class="message"></div>
    </div>
  `;

  // Initialize components
  const amountContainer = document.getElementById('amount-container');
  amountComponent = new Amount(amountContainer, mainState.currencyFormat, (amount, inflow) => {
    mainState.transactionAmount = amount;
    mainState.transactionAmountInflow = inflow;
    updateSubmitButton();
  });

  const accountContainer = document.getElementById('account-container');
  accountComponent = new Autocomplete(accountContainer, {
    type: 'account',
    array: mainState.accounts,
    update: (id, name, isTracking) => {
      mainState.transactionAccountId = id;
      mainState.transactionAccountName = name;
      mainState.transactionAccountIsTracking = isTracking;
      updateCategoryDisabled();
      updateSubmitButton();
    },
    showBalance: mainState.showAccountBalance,
    currencyFormat: mainState.currencyFormat
  });

  const payeeContainer = document.getElementById('payee-container');
  payeeComponent = new Autocomplete(payeeContainer, {
    type: 'payee',
    array: mainState.payees,
    update: (id, name, isTransfer) => {
      mainState.transactionPayeeId = id;
      mainState.transactionPayeeName = name;
      mainState.transactionPayeeIsTransfer = isTransfer !== null && isTransfer !== false;
      updateCategoryDisabled();
      updateSubmitButton();
    }
  });

  const categoryContainer = document.getElementById('category-container');
  categoryComponent = new Autocomplete(categoryContainer, {
    type: 'category',
    array: mainState.categories,
    disabled: mainState.transactionAccountIsTracking || mainState.transactionPayeeIsTransfer,
    update: (id, name) => {
      mainState.transactionCategoryId = id;
      mainState.transactionCategoryName = name;
      updateSubmitButton();
    },
    showBalance: mainState.showCategoryBalance,
    currencyFormat: mainState.currencyFormat
  });

  const flagContainer = document.getElementById('flag-container');
  flagComponent = new Flag(flagContainer, (flag) => {
    mainState.transactionFlag = flag;
  });

  memoInput = document.getElementById('memo-input');
  memoInput.addEventListener('input', (e) => {
    mainState.transactionMemo = e.target.value;
  });

  dateInput = document.getElementById('date-input');
  dateInput.addEventListener('change', (e) => {
    mainState.transactionDate = e.target.value;
    updateSubmitButton();
  });

  clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', () => {
    mainState.transactionCleared = !mainState.transactionCleared;
    const img = clearBtn.querySelector('img');
    img.src = mainState.transactionCleared ? 'assets/icons/clear-light.svg' : 'assets/icons/unclear-light.svg';
    img.alt = mainState.transactionCleared ? 'Transaction cleared' : 'Transaction not cleared';
  });

  submitBtn = document.getElementById('submit-btn');
  submitBtn.addEventListener('click', submit);

  const budgetSwitcher = document.getElementById('budget-switcher');
  if (budgetSwitcher) {
    budgetSwitcher.addEventListener('click', () => {
      chrome.storage.local.remove(['budgetId', 'budgetName'], () => {
        router.navigate('/');
      });
    });
  }

  const settingsBtn = document.getElementById('settings-btn');
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  updateUI();
}

function updateCategoryDisabled() {
  if (categoryComponent) {
    categoryComponent.setDisabled(mainState.transactionAccountIsTracking || mainState.transactionPayeeIsTransfer);
  }
}

function updateSubmitButton() {
  if (submitBtn) {
    submitBtn.disabled = !mainState.transactionAmount || !mainState.transactionDate || !mainState.transactionAccountId;
  }
}

function updateUI() {
  // Update components with new data
  if (accountComponent && mainState.accounts.length > 0) {
    accountComponent.setArray(mainState.accounts);
  }
  if (payeeComponent && mainState.payees.length > 0) {
    payeeComponent.setArray(mainState.payees);
  }
  if (categoryComponent && mainState.categories.length > 0) {
    categoryComponent.setArray(mainState.categories);
  }

  // Update loaders
  const loadingLoader = document.getElementById('loading-loader');
  const savingLoader = document.getElementById('saving-loader');

  if (mainState.loading && !mainState.saving) {
    loadingLoader.classList.add('visible');
    if (mainState.error) {
      loadingLoader.querySelector('.message').innerHTML = `
        <div class="error">
          <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
          <h1>Error</h1>
          <div class="error-message">${mainState.error.id}: ${mainState.error.detail}</div>
          <div class="buttons">
            <button onclick="initMain()">Retry</button>
          </div>
        </div>
      `;
    } else {
      loadingLoader.querySelector('.message').innerHTML = `
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        <h1>Loading...</h1>
      `;
    }
  } else {
    loadingLoader.classList.remove('visible');
  }

  if (mainState.saving) {
    savingLoader.classList.add('visible');
    if (mainState.error) {
      savingLoader.querySelector('.message').innerHTML = `
        <div class="error">
          <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
          <h1>Error</h1>
          <div class="error-message">${mainState.error.id}: ${mainState.error.detail}</div>
          <div class="buttons">
            <button onclick="submit()">Retry</button>
            <button onclick="mainState.loading = false; mainState.saving = false; updateUI();">Edit</button>
          </div>
        </div>
      `;
    } else if (mainState.loading) {
      savingLoader.querySelector('.message').innerHTML = `
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        <h1>Saving...</h1>
      `;
    } else {
      savingLoader.querySelector('.message').innerHTML = `
        <img src="assets/icons/check-circle.svg" alt="Success icon"></img>
        <h1>Saved!</h1>
      `;
      setTimeout(() => {
        mainState.saving = false;
        updateUI();
      }, 2000);
    }
  } else {
    savingLoader.classList.remove('visible');
  }
}

function resetForm() {
  mainState.transactionMemo = null;
  mainState.transactionFlag = null;
  mainState.transactionCleared = false;
  
  if (amountComponent) {
    amountComponent.setInflow(false);
    amountComponent.input.value = '';
    amountComponent.onUpdate(0, false);
  }
  
  if (accountComponent) {
    accountComponent.input.value = '';
    accountComponent.update(null, '');
  }
  
  if (payeeComponent) {
    payeeComponent.input.value = '';
    payeeComponent.update(null, '');
  }
  
  if (categoryComponent) {
    categoryComponent.input.value = '';
    categoryComponent.update(null, '');
  }
  
  if (flagComponent) {
    flagComponent.setFlag(null);
  }
  
  if (memoInput) memoInput.value = '';
  setLocalDate();
  updateSubmitButton();
}

async function submit() {
  const transaction = {
    account_id: mainState.transactionAccountId,
    date: mainState.transactionDate,
    amount: mainState.transactionAmountInflow ? Math.trunc(mainState.transactionAmount * 1000) : Math.trunc(mainState.transactionAmount * -1000),
    payee_id: mainState.transactionPayeeId,
    payee_name: mainState.transactionPayeeId ? null : mainState.transactionPayeeName,
    category_id: mainState.transactionCategoryId,
    memo: mainState.transactionMemo,
    cleared: mainState.transactionCleared ? 'cleared' : 'uncleared',
    approved: true,
    flag_color: mainState.transactionFlag
  };
  
  mainState.loading = true;
  mainState.saving = true;
  mainState.error = null;
  updateUI();

  try {
    const response = await postRequest('transactions', budgetId, transaction);
    const json = await response.json();
    if (json.error) {
      mainState.error = json.error;
      mainState.loading = false;
      updateUI();
    } else {
      mainState.loading = false;
      resetForm();
      updateUI();
    }
  } catch (error) {
    mainState.error = { id: 'Network Error', detail: error.message };
    mainState.loading = false;
    updateUI();
  }
}

function initMain() {
  mainState.loading = true;
  mainState.error = null;
  updateUI();
  getData('settings');
}

// Make functions available globally for onclick handlers
window.initMain = initMain;
window.submit = submit;

