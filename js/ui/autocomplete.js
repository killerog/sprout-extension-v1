// Autocomplete component - requires Fuse.js to be loaded
class Autocomplete {
  constructor(container, options) {
    this.container = container;
    this.type = options.type;
    this.array = options.array || [];
    this.update = options.update;
    this.showBalance = options.showBalance || false;
    this.currencyFormat = options.currencyFormat || null;
    this.disabled = options.disabled || false;
    
    this.showSuggestions = false;
    this.suggestions = JSON.parse(JSON.stringify(this.array));
    this.decimalDigits = !this.currencyFormat ? Math.pow(10, 3) : Math.pow(10, 3 - this.currencyFormat.decimal_digits);
    this.value = '';
    this.selectionMade = false;
    
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('mousedown', (e) => {
      if (this.wrapper && !this.wrapper.contains(e.target)) {
        if (this.showSuggestions) {
          this.showSuggestions = false;
          this.updateSuggestionsUI();
        }
      }
    });
  }

  formatNumber(number) {
    return parseFloat((number / this.decimalDigits), 10)
      .toLocaleString(undefined, { style: 'currency', currency: this.currencyFormat.iso_code, currencyDisplay: 'narrowSymbol' });
  }

  onFocus() {
    this.showSuggestions = true;
    this.selectionMade = false;
    this.filter(this.input.value);
    this.updateSuggestionsUI();
  }

  onKeyPress(event) {
    if (event.key === 'Enter') {
      this.autoSelect();
    }
  }

  onKeyDown(event) {
    if (event.key === 'Tab') {
      this.autoSelect();
    }
  }

  onAccountSelect(id, name, isBudget) {
    this.input.value = name;
    this.update(id, name, !isBudget);
    this.selectionMade = true;
    this.showSuggestions = false;
    this.updateSuggestionsUI();
  }

  onPayeeSelect(id, name, isTransfer) {
    this.input.value = name;
    this.update(id, name, isTransfer !== null);
    this.selectionMade = true;
    this.showSuggestions = false;
    this.updateSuggestionsUI();
  }

  onCategorySelect(id, groupName, name) {
    const categoryValue = groupName + ': ' + name;
    this.input.value = categoryValue;
    this.update(id, categoryValue);
    this.selectionMade = true;
    this.showSuggestions = false;
    this.updateSuggestionsUI();
  }

  autoSelect() {
    if (this.value.trim().length > 0 && !this.selectionMade) {
      let firstSuggestionFound = false;
      let index = 0;
      while (!firstSuggestionFound && index < this.suggestions.length) {
        if (this.type === 'category') {
          let group = this.suggestions[index];
          if (group.categories && group.categories.length > 0) {
            this.onCategorySelect(group.categories[0].id, group.name, group.categories[0].name);
            firstSuggestionFound = true;
          } else {
            index++;
          }
        } else {
          let group = this.suggestions[index];
          if (this.type === 'account') {
            if (group.accounts && group.accounts.length > 0) {
              this.onAccountSelect(group.accounts[0].id, group.accounts[0].name, group.accounts[0].on_budget);
              firstSuggestionFound = true;
            } else {
              index++;
            }
          } else {
            if (group.payees && group.payees.length > 0) {
              this.onPayeeSelect(group.payees[0].id, group.payees[0].name, group.payees[0].transfer_account_id);
              firstSuggestionFound = true;
            } else {
              index++;
            }
          }
        }
      }
    }
    this.showSuggestions = false;
    this.updateSuggestionsUI();
  }

  filter(value) {
    if (value) {
      let suggestions = JSON.parse(JSON.stringify(this.array));
      const fuseOptions = {
        shouldSort: false,
        threshold: 0.3,
        keys: ["name"]
      };
      if (this.type === 'category') {
        let categoryValue = value.split(': ');
        if (categoryValue.length > 1) {
          categoryValue = categoryValue.slice(1).join(': ');
        } else {
          categoryValue = categoryValue[0];
        }
        for (let categoryGroup of suggestions) {
          const fuse = new Fuse(categoryGroup.categories, fuseOptions);
          const results = fuse.search(categoryValue);
          let filteredItems = [];
          for (let result of results) {
            filteredItems.push(result.item);
          }
          categoryGroup.categories = filteredItems;
        }
      } else {
        for (let itemType of suggestions) {
          const fuse = new Fuse(this.type === 'account' ? itemType.accounts : itemType.payees, fuseOptions);
          const results = fuse.search(value);
          let filteredItems = [];
          for (let result of results) {
            filteredItems.push(result.item);
          }
          if (this.type === 'account') {
            itemType.accounts = filteredItems;
          } else {
            itemType.payees = filteredItems;
          }
        }
      }
      this.suggestions = suggestions;
    } else {
      this.suggestions = JSON.parse(JSON.stringify(this.array));
    }
    this.updateSuggestionsUI();
  }

  isGroupEmpty(group) {
    let empty = false;
    if (this.type === 'account') {
      empty = !group.accounts || group.accounts.length === 0;
    } else if (this.type === 'payee') {
      empty = !group.payees || group.payees.length === 0;
    } else {
      empty = group.deleted || group.hidden || !group.categories || group.categories.length === 0 || group.name === 'Hidden Categories';
    }
    return empty;
  }

  handleChange(event) {
    this.value = event.target.value;
    this.update(null, event.target.value);
    this.filter(event.target.value);
  }

  updateSuggestionsUI() {
    const ul = this.wrapper.querySelector('ul');
    if (!ul) return;

    if (!this.showSuggestions) {
      ul.style.display = 'none';
      return;
    }

    ul.style.display = 'block';
    let totalItems = 0;
    for (let group of this.suggestions) {
      if (this.type === 'account') {
        totalItems += (group.accounts || []).length;
      } else if (this.type === 'payee') {
        totalItems += (group.payees || []).length;
      } else if (this.type === 'category') {
        totalItems += (group.categories || []).length;
      }
    }

    let html = '';
    if (totalItems === 0) {
      html = `<li class="no-match"><span>${this.type === 'payee' ? 'Create new payee ' + this.value : 'No matching ' + this.type}</span></li>`;
    } else {
      for (let group of this.suggestions) {
        if (this.isGroupEmpty(group)) continue;
        
        html += `<div>${group.name}</div>`;
        
        if (this.type === 'category') {
          (group.categories || []).forEach(category => {
            if (category.deleted) return;
            const balanceHtml = category.name === 'Ready to Assign' ? '' :
              !this.showBalance ? '' :
              `<span class="${category.balance < 0 ? 'negative amount' : category.balance > 0 ? 'positive amount' : 'amount'}">${this.formatNumber(category.balance)}</span>`;
            html += `<li data-id="${category.id}" data-group="${group.name}" data-name="${category.name}"><span>${category.name}</span>${balanceHtml}</li>`;
          });
        } else if (this.type === 'account') {
          (group.accounts || []).forEach(account => {
            if (account.deleted || account.closed) return;
            const balanceHtml = !this.showBalance ? '' :
              `<span class="${account.balance < 0 ? 'negative amount' : 'amount'}">${this.formatNumber(account.balance)}</span>`;
            html += `<li data-id="${account.id}" data-name="${account.name}" data-budget="${account.on_budget}"><span>${account.name}</span>${balanceHtml}</li>`;
          });
        } else {
          (group.payees || []).forEach(payee => {
            if (payee.deleted) return;
            html += `<li data-id="${payee.id}" data-name="${payee.name}" data-transfer="${payee.transfer_account_id || ''}"><span>${payee.name}</span></li>`;
          });
        }
      }
    }
    ul.innerHTML = html;

    // Add click handlers
    ul.querySelectorAll('li').forEach(li => {
      if (li.classList.contains('no-match')) {
        li.addEventListener('mouseup', () => {
          this.showSuggestions = false;
          this.updateSuggestionsUI();
        });
        return;
      }

      li.addEventListener('mouseup', () => {
        if (this.type === 'category') {
          this.onCategorySelect(li.dataset.id, li.dataset.group, li.dataset.name);
        } else if (this.type === 'account') {
          this.onAccountSelect(li.dataset.id, li.dataset.name, li.dataset.budget === 'true');
        } else {
          this.onPayeeSelect(li.dataset.id, li.dataset.name, li.dataset.transfer);
        }
      });
    });
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.input) {
      this.input.disabled = disabled;
      this.input.placeholder = disabled ? 'Category not needed' : '';
      this.input.value = '';
      this.update(null);
    }
  }

  setArray(array) {
    this.array = array;
    this.suggestions = JSON.parse(JSON.stringify(array));
    this.updateSuggestionsUI();
  }

  render() {
    this.container.innerHTML = `
      <div class="autocomplete-field">
        <input ${this.disabled ? 'disabled' : ''} placeholder="${this.disabled ? 'Category not needed' : ''}" />
        <ul style="display: none;"></ul>
      </div>
    `;

    this.wrapper = this.container.querySelector('.autocomplete-field');
    this.input = this.wrapper.querySelector('input');
    
    this.input.addEventListener('focus', () => this.onFocus());
    this.input.addEventListener('change', (e) => this.handleChange(e));
    this.input.addEventListener('keypress', (e) => this.onKeyPress(e));
    this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
    
    this.updateSuggestionsUI();
  }
}

