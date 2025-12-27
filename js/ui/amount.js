class Amount {
  constructor(container, currencyFormat, onUpdate) {
    this.container = container;
    this.currencyFormat = currencyFormat;
    this.onUpdate = onUpdate;
    this.inflow = false;
    this.input = null;
    this.render();
  }

  formatInput() {
    if (this.input.value.trim().length > 0) {
      let splitInput = this.input.value.split('.');
      if (splitInput[0] === '') {
        splitInput[0] = '0';
      }
      if (this.currencyFormat.decimal_digits === 0) {
        this.input.value = splitInput[0];
      } else {
        let decimals = '';
        if (splitInput.length === 1) {
          for (let i = 0; i < this.currencyFormat.decimal_digits; i++) {
            decimals += '0';
          }
        } else {
          decimals = splitInput[1];
          while (decimals.length !== this.currencyFormat.decimal_digits) {
            if (decimals.length < this.currencyFormat.decimal_digits) {
              decimals += '0';
            } else {
              decimals = decimals.substring(0, decimals.length - 1);
            }
          }
        }
        this.input.value = splitInput[0] + '.' + decimals;
      }
      this.onUpdate(parseFloat(this.input.value), this.inflow);
    } else {
      this.onUpdate(0, this.inflow);
    }
  }

  setInflow(state) {
    this.inflow = state;
    this.updateUI();
    this.onUpdate(parseFloat(this.input.value) || 0, this.inflow);
  }

  setPlaceholder() {
    if (this.currencyFormat === null) {
      return '';
    }
    if (this.currencyFormat.decimal_digits === 0) {
      return !this.currencyFormat.display_symbol ? '0' : 
        this.currencyFormat.symbol_first ? this.currencyFormat.currency_symbol + '0' :
        '0' + this.currencyFormat.currency_symbol;
    }
    let decimals = '';
    for (let i = 0; i < this.currencyFormat.decimal_digits; i++) {
      decimals = '0'.concat(decimals);
    }
    const placeholder = '0' + this.currencyFormat.decimal_separator + decimals;
    return !this.currencyFormat.display_symbol ? placeholder :
      this.currencyFormat.symbol_first ? this.currencyFormat.currency_symbol + placeholder :
      placeholder + this.currencyFormat.currency_symbol;
  }

  setStep() {
    if (this.currencyFormat.decimal_digits === 0) {
      return '1';
    } 
    let step = '1';
    for (let i = 0; i < this.currencyFormat.decimal_digits - 1; i++) {
      step = '0'.concat(step);
    }
    return '0.'.concat(step);
  }

  updateUI() {
    if (this.inflow) {
      this.input.classList.remove('outflow');
      this.input.classList.add('inflow');
      this.container.querySelector('.switch').classList.remove('outflow');
      this.container.querySelector('.switch').classList.add('inflow');
    } else {
      this.input.classList.remove('inflow');
      this.input.classList.add('outflow');
      this.container.querySelector('.switch').classList.remove('inflow');
      this.container.querySelector('.switch').classList.add('outflow');
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="amount">
        <input
          class="outflow"
          type="number"
          step="${this.currencyFormat === null ? '' : this.currencyFormat.decimal_digits === 0 ? '1' : this.setStep()}"
          min="0"
          placeholder="${this.currencyFormat === null ? '' : this.setPlaceholder()}"
          ${this.currencyFormat === null ? 'disabled' : ''}
        />
        <div class="switch outflow">
          <div class="thumb"></div>
          <div class="label outflow" tabindex="0">Outflow</div>
          <div class="label inflow" tabindex="0">Inflow</div>
        </div>
      </div>
    `;

    this.input = this.container.querySelector('input');
    this.input.addEventListener('blur', () => this.formatInput());

    const outflowLabel = this.container.querySelector('.label.outflow');
    const inflowLabel = this.container.querySelector('.label.inflow');

    outflowLabel.addEventListener('click', () => this.setInflow(false));
    inflowLabel.addEventListener('click', () => this.setInflow(true));
    
    outflowLabel.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.setInflow(false);
    });
    inflowLabel.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.setInflow(true);
    });
  }
}

