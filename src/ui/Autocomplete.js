import React from 'react';
import './Autocomplete.css';
import Fuse from 'fuse.js';

class Autocomplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSuggestions: false,
      suggestions: this.props.array,
      decimalDigits: !this.props.currencyFormat ? Math.pow(10, 3) : Math.pow(10, 3 - this.props.currencyFormat.decimal_digits),
      value: '',
      selectionMade: false
    }
    this.inputRef = React.createRef();
    this.wrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (this.props.type === 'category') {
      if (this.props.disabled !== prevProps.disabled && this.props.disabled !== undefined) {
        this.inputRef.current.disabled = this.props.disabled;
        this.inputRef.current.placeholder = this.props.disabled ? 'Category not needed' : '';
        this.inputRef.current.value = '';
        this.props.update(null);
      }
    }
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      if (this.state.showSuggestions) {
        this.setState({ showSuggestions: false });
      }
    }
  }

  formatNumber(number) {
    return parseFloat((number / this.state.decimalDigits), 10)
      .toLocaleString(undefined, { style: 'currency', currency: this.props.currencyFormat.iso_code, currencyDisplay: 'narrowSymbol' });
  }

  onFocus = () => {
    this.setState({showSuggestions: true, selectionMade: false}, () => {
      this.filter(this.inputRef.current.value);
    });
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.autoSelect();
    } 
  }

  onKeyDown = (event) => {
    if (event.key === 'Tab') {
      this.autoSelect();
    }
  }

  onAccountSelect(id, name, isBudget) {
    this.inputRef.current.value = name;
    this.props.update(id, name, !isBudget)
    this.setState({ selectionMade: true, showSuggestions: false });
  }

  onPayeeSelect(id, name, isTransfer) {
    this.inputRef.current.value = name;
    this.props.update(id, name, isTransfer !== null)
    this.setState({ selectionMade: true, showSuggestions: false });
  }

  onCategorySelect(id, groupName, name) {
    const categoryValue = groupName + ': ' + name;
    this.inputRef.current.value = categoryValue;
    this.props.update(id, categoryValue)
    this.setState({ selectionMade: true, showSuggestions: false });
  }

  autoSelect() {
    if (this.state.value.trim().length > 0 && !this.state.selectionMade) {
      let firstSuggestionFound = false;
      let index = 0;
      while (!firstSuggestionFound && index < this.state.suggestions.length) {
        if (this.props.type === 'category') {
          let group = this.state.suggestions[index];
          if (group.categories.length > 0) {
            this.onCategorySelect(group.categories[0].id, group.name, group.categories[0].name)
            firstSuggestionFound = true;
          } else {
            index++;
          }
        } else {
          let group = this.state.suggestions[index];
          if (this.props.type === 'account') {
            if (group.accounts.length > 0) {
              this.onAccountSelect(group.accounts[0].id, group.accounts[0].name, group.accounts[0].on_budget)
              firstSuggestionFound = true;
            } else {
              index++;
            }
          } else {
            if (group.payees.length > 0) {
              this.onPayeeSelect(group.payees[0].id, group.payees[0].name, group.payees[0].transfer_account_id)
              firstSuggestionFound = true;
            } else {
              index++;
            }
          }
        }
      }
    }
    this.setState({showSuggestions: false});
  }

  filter(value) {
    if (value) {
      let suggestions = JSON.parse(JSON.stringify(this.props.array));
      const fuseOptions = {
        shouldSort: false,
        threshold: 0.3,
        keys: ["name"]
      };
      if (this.props.type === 'category') {
        let categoryValue = value.split(': ')
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
          const fuse = new Fuse(this.props.type === 'account' ? itemType.accounts : itemType.payees, fuseOptions);
          const results = fuse.search(value);
          let filteredItems = [];
          for (let result of results) {
            filteredItems.push(result.item);
          }
          if (this.props.type === 'account') {
            itemType.accounts = filteredItems;
          } else {
            itemType.payees = filteredItems;
          }
        }
      }
      this.setState({ suggestions });
    } else {
      this.setState({ suggestions: this.props.array });
    }
  }

  isGroupEmpty(group) {
    let empty = false;
    if (this.props.type === 'account') {
      empty = group.accounts.length === 0
    } else if (this.props.type === 'payee') {
      empty = group.payees.length === 0
    } else {
      empty = group.deleted || group.hidden || group.categories.length === 0 || group.name === 'Hidden Categories'
    }
    return empty;
  }

  handleChange = (event) => {
    this.props.update(null, event.target.value);
    this.filter(event.target.value);
    this.setState({value: event.target.value});
  }

  render() {
    let totalItems = 0;
    for (let group of this.state.suggestions) {
      if (this.props.type === 'account') {
        totalItems += group.accounts.length
      } else if (this.props.type === 'payee') {
        totalItems += group.payees.length
      } else if (this.props.type === 'category') {
        totalItems += group.categories.length;
      }
    }
    return <div className="autocomplete-field" ref={ this.wrapperRef }>
      <input 
        ref={ this.inputRef }
        onFocus={ this.onFocus }
        onChange={ this.handleChange }
        onKeyDown={ this.onKeyDown }
        onKeyPress={ this.onKeyPress }></input>
      { this.state.showSuggestions === false ? null : 
      <ul className="autocomplete-selection">
        { totalItems === 0 ? 
          <li key="No match" className="no-match" onMouseUp={() => this.setState({ showSuggestions: false }) }>
            <span>{ this.props.type === 'payee' ? 'Create new payee ' + this.state.value : 'No matching ' + this.props.type }</span>
          </li> : 
          this.state.suggestions.map((group) => {
            return this.isGroupEmpty(group) ? null :
            <React.Fragment>
              <div key={ group.name }>{ group.name }</div>
              { this.props.type === 'category' ? group.categories.map((category) => {
                return category.deleted ? null : 
                <li key={category.id} onMouseUp={() => { this.onCategorySelect(category.id, group.name, category.name) }}>
                  <span>{ category.name }</span>
                  { category.name === 'Ready to Assign' ? '' :
                    !this.props.showBalance ? null :
                    <span className={ category.balance < 0 ? 'negative amount' : category.balance > 0 ? 'positive amount' : 'amount' }>
                      { this.formatNumber(category.balance) }
                    </span> }
                </li>
                }) : 
                this.props.type === 'account' ? group.accounts.map((account) => {
                  return account.deleted || account.closed ? null :
                  <li key={ account.id } onMouseUp={() => { this.onAccountSelect(account.id, account.name, account.on_budget) }}>
                    <span>{ account.name }</span>
                    { !this.props.showBalance ? null : 
                      <span className={ account.balance < 0 ? 'negative amount' : 'amount' }>{ this.formatNumber(account.balance) }</span>
                    }
                  </li>
                }) : group.payees.map((payee) => {
                  return payee.deleted ? null : 
                  <li key={ payee.id } onMouseUp={ () => { this.onPayeeSelect(payee.id, payee.name, payee.transfer_account_id) } }>
                    <span>{ payee.name }</span>
                  </li>
                }) }
            </React.Fragment>
          })
        }
      </ul>
      }
    </div>
  }
}

export default Autocomplete;