/* global chrome */
import React from 'react';
import './main.css';
import Autocomplete from '../ui/Autocomplete';
import Amount from '../ui/Amount';
import Flag from '../ui/Flag';
import { navigate } from '@reach/router';
import { getRequest, postRequest } from '../api/ynab';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      showCategoryBalance: null,
      key: Date.now()
    };
    this.dateInputRef = React.createRef();
    this.memoInputRef = React.createRef();
  }

  componentDidMount() {
    this.updateAmount = this.updateAmount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.updatePayee = this.updatePayee.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.updateFlag = this.updateFlag.bind(this);
    this.init();
  }

  init() {
    this.setState({ error: null });
    
    if (this.props.id === 'index.html') {
      navigate('/');
    } else {
      chrome.storage.local.get(data => {
        if (!data.refreshToken) {
          navigate('login');
        } else if (!data.budgetName) {
          navigate('/');
        } else {
          this.setState({ 
            budgetName: data.budgetName,
            showBudgetSwitch: data.budgetMultiple,
            showAccountBalance: !data['setting-balance'] || data['setting-balance'] === 'show-account',
            showCategoryBalance: !data['setting-balance'] || data['setting-balance'] === 'show-category'
          });
          this.getData('settings');
        }
      });
    }
  }

  getData(endpoint) {
    const cacheName = 'cache-' + endpoint + '-' + this.props.id;
    chrome.storage.local.get(data => {
      if (data[cacheName]) {
        if (endpoint === 'settings') {
          this.setSettings(data[cacheName]);
        } else if (endpoint === 'accounts') {
          this.setAccounts(data[cacheName]);
        } else if (endpoint === 'payees') {
          this.setPayees(data[cacheName]);
        } else if (endpoint === 'categories') {
          this.setCategories(data[cacheName]);
        }
      } else {
        getRequest(endpoint, this.props.id).then(response => response.json())
          .then(json => {
            if (json.error) {
              if (json.error.id === '404.2') {
                chrome.storage.local.remove(['budgetId', 'budgetName'], () => navigate('/'));
              } else {
                this.setState({ error: json.error });
              }
            } else {
              if (endpoint === 'settings') {
                if (data['setting-cache']) {
                  chrome.storage.local.set({ [cacheName]: json.data.settings });
                }
                this.setSettings(json.data.settings);
              } else if (endpoint === 'accounts') {
                if (data['setting-cache']) {
                  chrome.storage.local.set({ [cacheName]: json.data.accounts });
                }
                this.setAccounts(json.data.accounts);
              } else if (endpoint === 'payees') {
                if (data['setting-cache']) {
                  chrome.storage.local.set({ [cacheName]: json.data.payees });
                }
                this.setPayees(json.data.payees);
              } else if (endpoint === 'categories') {
                if (data['setting-cache']) {
                  chrome.storage.local.set({ [cacheName]: json.data.category_groups });
                }
                this.setCategories(json.data.category_groups);
              }
            }
          });
      }      
    });
  }

  setSettings(settings) {
    this.setState({
      currencyFormat: settings.currency_format,
    }, () => {
      this.getData('accounts');
      this.getData('categories');
      this.setLocalDate();
      this.setState({ transactionDate: this.dateInputRef.current.value });
    });
  }

  setAccounts(accounts) {
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
    accounts = [budgetAccounts, trackingAccounts];
    this.setState({ accounts, closedAccounts: closedAccountsIds }, () => {
      this.getData('payees');
    });
  }

  setPayees(payees) {
    // remove Starting Balance, Manual Balance Adjustment and Reconciliation Balance Adjustment
    const START = 'Starting Balance';
    const MANUAL = 'Manual Balance Adjustment';
    const RECONCILIATION = 'Reconciliation Balance Adjustment';
    let savedPayees = {name: 'Saved Payees', payees: []};
    let transferPayees = {name: 'Payments and Transfers', payees: []};
    for (let payee of payees) {
      let name = payee.name
      if (!(name === START || name === MANUAL || name === RECONCILIATION)) {
        if (payee.transfer_account_id) {
          if (this.state.closedAccounts.indexOf(payee.transfer_account_id) === -1) {
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
      if (payeeA < payeeB) {
        return -1;
      }
      if (payeeA > payeeB) {
        return 1;
      }
      return 0;
    });
    transferPayees.payees = transferPayees.payees.sort((a, b) => {
      let payeeA = a.name.toUpperCase();
      let payeeB = b.name.toUpperCase();
      if (payeeA < payeeB) {
        return -1;
      }
      if (payeeA > payeeB) {
        return 1;
      }
      return 0;
    });
    payees = [savedPayees, transferPayees];
    this.setState({ payees }, () => this.setState({ loading: this.isLoading() }))
  }

  setCategories(categoryGroups) {
    let inflowFound = false;
    let creditCardFound = false;
    let index = 0;
    const INFLOW_NAME = 'Inflow';
    while ((!inflowFound && !creditCardFound) || index < categoryGroups.length) {
      if (categoryGroups[index].name === 'Internal Master Category') {
        categoryGroups[index].name = INFLOW_NAME
        let inflowIndex = 0;
        while (inflowIndex < categoryGroups[index].categories.length) {
          const inflowCategory = categoryGroups[index].categories
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
    this.setState({ categories: sortedCategories }, () => this.setState({ loading: this.isLoading() }))
  }

  setLocalDate() {
    const offset = (new Date()).getTimezoneOffset() * 60000;
    const localDate = (new Date(Date.now() - offset)).toISOString().split('T')[0];
    this.setState({
      localDate,
      transactionDate: localDate
    });
    this.dateInputRef.current.value = localDate;
  }

  openBudgetSwitcher() {
    chrome.storage.local.remove(['budgetId', 'budgetName'], () => {
      navigate('/');
    });
  }

  isLoading() {
    return !(this.state.accounts.length > 0 &&
    this.state.payees.length > 0 &&
    this.state.categories.length > 0 &&
    this.state.currency_format !== null);
  }

  handleChange = (event) => {
    this.setState({transactionAmount: event.target.value ? parseFloat(event.target.value) : 0})
  }

  resetForm() {
    this.setState({
      transactionMemo: null,
      transactionFlag: null,
      transactionCleared: false,
      key: Date.now()
    }, () => {
      this.updateAmount(0, false);
      this.updateAccount(null, '', false);
      this.updatePayee(null, '', false);
      this.updateCategory(null, '');
      this.updateFlag(null);
      this.memoInputRef.current.value = '';
      this.setLocalDate();
    });
  }

  updateAmount(transactionAmount, transactionAmountInflow) {
    this.setState({
      transactionAmount,
      transactionAmountInflow
    });
  }

  updateAccount(transactionAccountId, transactionAccountName, transactionAccountIsTracking) {
    this.setState({
      transactionAccountId,
      transactionAccountName,
      transactionAccountIsTracking
    });
  }

  updatePayee(transactionPayeeId, transactionPayeeName, transactionPayeeIsTransfer) {
    this.setState({
      transactionPayeeId,
      transactionPayeeName,
      transactionPayeeIsTransfer
    });
  }

  updateCategory(transactionCategoryId, transactionCategoryName) {
    this.setState({
      transactionCategoryId,
      transactionCategoryName
    });
  }

  updateMemo = (event) => {
    this.setState({ transactionMemo: event.target.value });
  }

  updateDate = (event) => {
    this.setState({ transactionDate: event.target.value });
  }

  updateClear = () => {
    this.setState({ transactionCleared: !this.state.transactionCleared });
  }

  updateFlag(transactionFlag) {
    this.setState({
      transactionFlag
    });
  }

  async submit() {
    const transaction = {
      account_id: this.state.transactionAccountId,
      date: this.state.transactionDate,
      amount: this.state.transactionAmountInflow ? Math.trunc(this.state.transactionAmount * 1000) : Math.trunc(this.state.transactionAmount * -1000),
      payee_id: this.state.transactionPayeeId,
      payee_name: this.state.transactionPayeeId ? null : this.state.transactionPayeeName,
      category_id: this.state.transactionCategoryId,
      memo: this.state.transactionMemo,
      cleared: this.state.transactionCleared ? 'cleared' : 'uncleared',
      approved: true,
      flag_color: this.state.transactionFlag
    };
    this.setState({
      loading: true,
      saving: true,
      error: null
    });
    postRequest('transactions', this.props.id, transaction).then(response => response.json())
      .then(json => {
        if (json.error) {
          this.setState({ error: json.error });
        } else {
          this.setState({ loading: false });
          this.resetForm();
          setTimeout(() => this.setState({ saving: false }), 2000);
        }
      });
  }

  render() {
    return (
      <React.Fragment>
        <main className="main-view" key={this.state.key}>
          <header>
            <h1>{ this.state.budgetName }</h1>
            <section>
              {!this.state.showBudgetSwitch ? null :
                <button title="Switch budget" className="budget-switcher icon" onClick={() => this.openBudgetSwitcher()}>
                  <img src="assets/icons/folder-open.svg" alt="Open budget"></img>
                </button>
              }
              <button title="Settings" className="settings icon" onClick={() => chrome.runtime.openOptionsPage()}>
                <img src="assets/icons/cog.svg" alt="Open settings"></img>
              </button>
            </section>
          </header>
          <Amount 
            update={this.updateAmount}
            currencyFormat={this.state.currencyFormat}></Amount>
          <h2>Account</h2>
          <Autocomplete
            array={this.state.accounts}
            type={'account'}
            update={this.updateAccount}
            showBalance={this.state.showAccountBalance}
            currencyFormat={this.state.currencyFormat}></Autocomplete>
          <h2>Payee</h2>
          <Autocomplete
            array={this.state.payees}
            type={'payee'}
            update={this.updatePayee}></Autocomplete>
          <h2>Category</h2>
          <Autocomplete 
            array={this.state.categories}
            disabled={this.state.transactionAccountIsTracking || this.state.transactionPayeeIsTransfer}
            type={'category'}
            update={this.updateCategory}
            showBalance={this.state.showCategoryBalance}
            currencyFormat={this.state.currencyFormat}></Autocomplete>
          <h2>Memo</h2>
          <input data-testid="memo" ref={this.memoInputRef} onChange={this.updateMemo} maxLength="200"></input>
          <div className="bottom-row">
            <div>
              <h2>Date</h2>
              <input data-testid="transaction-date" ref={this.dateInputRef} type="date" onChange={this.updateDate} max={this.state.localDate}></input>
            </div>
            <div>
              <h2>Flag</h2>
              <Flag update={this.updateFlag}></Flag>
            </div>
            <div>
              <h2>Clear</h2>
              <div className="content-row">
                <button title="Clear" className="icon" onClick={this.updateClear}>
                  <img src={this.state.transactionCleared ? 'assets/icons/clear-light.svg' : 'assets/icons/unclear-light.svg'}
                    alt={this.state.transactionCleared ? 'Transaction cleared' : 'Transaction not cleared'} className="no-invert"></img>
                </button>
              </div>
            </div>
          </div>
          <button className="submit" onClick={() => this.submit()} disabled={!this.state.transactionAmount || !this.state.transactionDate || !this.state.transactionAccountId}>Save Transaction</button>
        </main>
        <div className={this.state.loading && !this.state.saving ? 'loader visible' : 'loader'}>
          <div className="message">{ !this.state.error ? 
            <React.Fragment>
              <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
              <h1>Loading...</h1>
            </React.Fragment> : 
            <div className="error">
              <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
              <h1>Error</h1>
              <div className="error-message">{ this.state.error.id }: { this.state.error.detail }</div>
              <div className="buttons">
                <button onClick={() => this.init()}>Retry</button>
              </div>
            </div>
           }
          </div>
        </div>
        <div className={this.state.saving ? 'loader visible' : 'loader'}>
          <div className="message">{ !this.state.error ? (this.state.loading ?
            <React.Fragment>
              <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
              <h1>Saving...</h1>
            </React.Fragment> : 
            <React.Fragment>
              <img src="assets/icons/check-circle.svg" alt="Success icon"></img>
              <h1>Saved!</h1>
            </React.Fragment>
          ) : 
            <div className="error">
              <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
              <h1>Error</h1>
              <div className="error-message">{ this.state.error.id }: { this.state.error.detail }</div>
              <div className="buttons">
                <button onClick={() => this.submit()}>Retry</button>
                <button onClick={() => this.setState({ loading: false, saving: false })}>Edit</button>
              </div>
            </div>
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Main;
