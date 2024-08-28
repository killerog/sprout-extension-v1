import React from 'react';
import './Amount.css';

class Amount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inflow: false
    }
    this.inputRef = React.createRef();
  }

  formatInput = (event) => {
    if (event.target.value.trim().length > 0) {
      let splitInput = event.target.value.split('.');
      if (splitInput[0] === '') {
        splitInput[0] = '0'
      }
      if (this.props.currencyFormat.decimal_digits === 0) {
        this.inputRef.current.value = splitInput[0];
      } else {
        let decimals = ''
        if (splitInput.length === 1) {
          for (let i = 0; i < this.props.currencyFormat.decimal_digits; i++) {
            decimals += '0'
          }
        } else {
          decimals = splitInput[1];
          while (decimals.length !== this.props.currencyFormat.decimal_digits) {
            if (decimals.length < this.props.currencyFormat.decimal_digits) {
              decimals += '0'
            } else {
              decimals = decimals.substring(0, decimals.length - 1);
            }
          }
        }
        this.inputRef.current.value = splitInput[0] + '.' + decimals;
      }
      this.props.update(parseFloat(this.inputRef.current.value), this.state.inflow);
    } else {
      this.props.update(0, this.state.inflow);
    }
  }

  setInflow(state) {
    this.setState({ inflow: state }, () => {
      this.props.update(parseFloat(this.inputRef.current.value), this.state.inflow);
    });
  }

  setPlaceholder() {
    if (this.props.currencyFormat === null) {
      return '';
    }
    if (this.props.currencyFormat.decimal_digits === 0) {
      return !this.props.currencyFormat.display_symbol ? '0' : 
        this.props.currencyFormat.symbol_first ? this.props.currencyFormat.currency_symbol + '0' :
        '0' + this.props.currencyFormat.currency_symbol
    }
    let decimals = '';
    for (let i = 0; i < this.props.currencyFormat.decimal_digits; i++) {
      decimals = '0'.concat(decimals);
    }
    const placeholder = '0' + this.props.currencyFormat.decimal_separator + decimals;
    return !this.props.currencyFormat.display_symbol ? placeholder :
      this.props.currencyFormat.symbol_first ? this.props.currencyFormat.currency_symbol + placeholder :
      placeholder + this.props.currencyFormat.currency_symbol
  }

  setStep() {
    if (this.props.currencyFormat.decimal_digits === 0) {
      return '1';
    } 
    let step = '1';
    for (let i = 0; i < this.props.currencyFormat.decimal_digits - 1; i++) {
      step = '0'.concat(step);
    }
    return '0.'.concat(step);
  };

  onKeyPressOutflow = (event) => {
    if (event.key === 'Enter') {
      this.setInflow(false);
    }
  }

  onKeyPressInflow = (event) => {
    if (event.key === 'Enter') {
      this.setInflow(true);
    }
  }

  render() {
    return (
      <div className="amount">
        <input
          className={ this.state.inflow ? 'inflow' : 'outflow' }
          ref={ this.inputRef }
          type="number"
          step={ this.props.currencyFormat === null ? '' : this.props.currencyFormat.decimal_digits === 0 ? '1' : this.setStep() }
          min="0"
          onBlur={ this.formatInput }
          placeholder={ this.props.currencyFormat === null ? '' : this.setPlaceholder() }
          disabled={ this.props.currencyFormat === null }
          />
        <div className={ this.state.inflow ? 'switch inflow' : 'switch outflow' }>
          <div className="thumb"></div>
          <div className="label outflow" tabIndex="0" onKeyPress={this.onKeyPressOutflow} onClick={ () => this.setInflow(false) }>Outflow</div>
          <div className="label inflow" tabIndex="0" onKeyPress={this.onKeyPressInflow} onClick={ () => this.setInflow(true) }>Inflow</div>
        </div>
      </div>
    );
  }
}

export default Amount;