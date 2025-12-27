/* global chrome */
async function renderBudget() {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <div class="loader visible" id="loader">
      <div class="message">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        <h1>Loading...</h1>
      </div>
    </div>
  `;

  const loader = document.getElementById('loader');
  
  function showError(error) {
    loader.innerHTML = `
      <div class="message">
        <div class="error">
          <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
          <h1>Error</h1>
          <div class="error-message">${error.id}: ${error.detail}</div>
          <div class="buttons">
            <button onclick="init()">Retry</button>
          </div>
        </div>
      </div>
    `;
  }

  function showBudgets(budgets) {
    if (budgets.length === 1) {
      selectBudget(budgets[0], false);
    } else {
      loader.classList.remove('visible');
      root.innerHTML = `
        <main class="budgets">
          <h1>Select Budget</h1>
          <p>Select the budget to add transactions to.</p>
          <ul id="budget-list"></ul>
        </main>
      `;
      
      const list = document.getElementById('budget-list');
      budgets.forEach(budget => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div>
            <div class="budget-name">${budget.name}</div>
          </div>
        `;
        li.addEventListener('click', () => selectBudget(budget, true));
        list.appendChild(li);
      });
    }
  }

  function selectBudget(budget, hasMultipleBudgets) {
    chrome.storage.local.set({ 
      budgetId: budget.id, 
      budgetName: budget.name, 
      budgetMultiple: hasMultipleBudgets 
    }, () => {
      router.navigate('/' + budget.id);
    });
  }

  async function init() {
    loader.classList.add('visible');
    loader.innerHTML = `
      <div class="message">
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        <h1>Loading...</h1>
      </div>
    `;

    chrome.storage.local.get(['budgetId', 'setting-cache', 'cache-budgets'], async (settings) => {
      if (settings.budgetId) {
        router.navigate('/' + settings.budgetId);
      } else if (settings['cache-budgets']) {
        showBudgets(settings['cache-budgets']);
      } else {
        try {
          const response = await getRequest('', '');
          const json = await response.json();
          if (json.error) {
            showError(json.error);
          } else {
            const budgets = json.data.budgets;
            if (settings['setting-cache']) {
              chrome.storage.local.set({ 'cache-budgets': budgets });
            }
            showBudgets(budgets);
          }
        } catch (error) {
          showError({ id: 'Network Error', detail: error.message });
        }
      }
    });
  }

  // Make init available globally for retry button
  window.init = init;
  
  init();
}

