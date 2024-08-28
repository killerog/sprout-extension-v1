/* global chrome */
import React from 'react';
import './budget.css';
import { navigate } from "@reach/router"
import { getRequest } from '../api/ynab';

class Budget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgets: [],
      loading: true,
      error: null,
      cacheName: 'cache-budgets'
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.setState({ error: null }, () => {
      chrome.storage.local.get(['budgetId', 'setting-cache', this.state.cacheName], settings => {
        if (settings.budgetId) {
          navigate('/' + settings.budgetId);
        } else if (settings[this.state.cacheName]) {
          this.populateBudgetList(settings[this.state.cacheName]);
        } else {
          getRequest('', '').then(response => response.json())
            .then(json => {
              if (json.error) {
                this.setState({ error: json.error });
              } else {
                const budgets = json.data.budgets;
                if (settings['setting-cache']) {
                  chrome.storage.local.set({ [this.state.cacheName]: budgets });
                }
                this.populateBudgetList(budgets);
              }
            });
        }
      });
    });
  }

  populateBudgetList(budgets) {
    if (budgets.length === 1) {
      this.selectBudget(budgets[0], false);
    } else {
      this.setState({ budgets }, () => { this.setState({ loading: false }) });
    }
  }

  selectBudget(budget, hasMultipleBudgets) {
    chrome.storage.local.set({ budgetId: budget.id, budgetName: budget.name, budgetMultiple: hasMultipleBudgets }, () => {
      navigate('/' + budget.id);
    });
  }

  render() {
    return this.state.loading ? 
      <div className={!this.state.loading ? 'loader' : 'loader visible'}>
        {this.state.error ?
          <div className="error">
            <img src="assets/icons/x-circle.svg" alt="Error icon"></img>
            <h1>Error</h1>
            <div className="error-message">{ this.state.error.id }: { this.state.error.detail }</div>
            <div className="buttons">
              <button onClick={() => this.init()}>Retry</button>
            </div>
          </div> : 
          <div className="message">
            <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            <h1>Loading...</h1>
          </div>
        }
      </div> :
      <main className="budgets">
        <h1>Select Budget</h1>
        <p>Select the budget to add transactions to.</p>
        <ul>
          {this.state.budgets.map((budget) => {
            return <li key={budget.id} onClick={() => { this.selectBudget(budget, true) }}>
              <div>
                <div className="budget-name">{budget.name}</div>
              </div>
            </li>
          })}
        </ul>
      </main>
  }
}

export default Budget;