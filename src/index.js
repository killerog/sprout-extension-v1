/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Login from './views/login';
import Main from './views/main';
import Budget from './views/budget';
import { Router, navigate } from "@reach/router"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: null,
      extensionVersion: process.env.REACT_APP_EXTENSION_VERSION,
      cacheVersion: parseFloat(process.env.REACT_APP_CACHE_VERSION),
      extensionUpdated: false,
      privacyPolicyUpdated: false
    }
  }

  componentDidMount() {
    chrome.runtime.connect({ name: 'popup' });
    chrome.storage.local.get(data => {
      // set theme
      if (data['setting-theme']) {
        this.setState({theme: data['setting-theme']});
      }
      // not logged in
      if (!data.refreshToken) {
        navigate('login');
      } 
      // logged in
      else {
        // check for updated Privacy Policy (do not block if worker is not available)
        const privacyInit = {
          method: 'GET',
          mode: 'cors'
        }
        const privacyUrl = process.env.REACT_APP_AUTHORIZATION_URL + 'privacy';
        fetch(privacyUrl, privacyInit).then(res => res.json()).then(json => {
          if (json) {
            this.setState({ privacyPolicyUpdated: json.lastUpdated > data['privacy-agree-date'] });
          }
        });
        if (data['last-extension-version'] !== this.state.extensionVersion) {
          chrome.storage.local.set({ 'last-extension-version': this.state.extensionVersion }, () => this.setState({ extensionUpdated: true }));
        }
        // clear cache if expired or new cache version
        if (!data['cache-version'] || data['cache-version'] !== this.state.cacheVersion || Date.now() >= data['cache-expiry']) {
          this.resetCache(data);
        } else {
          navigate('/');
        }
      }
    });
  }

  resetCache(settings) {
    let cachedKeys = []
    for (let key of Object.keys(settings)) {
      if (key.startsWith('cache-')) {
        cachedKeys.push(key);
      }
    }
    chrome.storage.local.remove(cachedKeys, () => {
      chrome.storage.local.set({ 'cache-version': this.state.cacheVersion }, () => {
        navigate('/');
      })
    })
  }

  updatePrivacyPolicyAgreeDate() {
    chrome.storage.local.set({ 'privacy-agree-date': Date.now() });
    this.setState({ privacyPolicyUpdated: false });
  }

  openTab() {
    window.open("[WEBSITE_URL]/shutdown");
    this.setState({ extensionUpdated: false });
  }

  render() {
    return (
      <div className={!this.state.theme ? 'App' : this.state.theme === 'dark' ? 'App dark-theme' : 'App light-theme'}>
        <Router>
          <Budget path="/" />
          <Main path="/:id" />
          <Login path="login" />
        </Router>
        <div className={this.state.extensionUpdated || this.state.privacyPolicyUpdated ? 'modal-container visible' : 'modal-container'}>
          <aside>
          {this.state.extensionUpdated && <React.Fragment>
            <header>Notice</header>
            <p>Sprout for YNAB will be shutting down on August 31, 2024.</p>
            <button onClick={ () => this.openTab() }>Read more</button>
          </React.Fragment>}
          {/* {this.state.extensionUpdated ? <React.Fragment>
            <header>Extension updated</header>
            <p>{process.env.REACT_APP_NAME} has been updated to version { this.state.extensionVersion }.</p>
            <p><a href="[WEBSITE_URL]/updates" target="_blank" rel="noopener noreferrer">View the changelog</a></p>
            <button onClick={ () => this.setState({ extensionUpdated: false })}>Okay</button>
          </React.Fragment> : this.state.privacyPolicyUpdated ? <React.Fragment>
            <header>Privacy Policy updated</header>
            <p>{process.env.REACT_APP_NAME}'s Privacy Policy has been updated. Please read over it before continuing to use the extension.</p>
            <p><a href="[WEBSITE_URL]/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            <button onClick={ () => this.updatePrivacyPolicyAgreeDate() }>I agree to the Privacy Policy</button>
          </React.Fragment>
          : ''} */}
          </aside>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
