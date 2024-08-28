/* global chrome */
import React from 'react';
import './login.css';
import { navigate } from '@reach/router';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoginModal: false
    };
    this.buttonRef = React.createRef();
  }

  componentDidMount(){
    chrome.storage.onChanged.addListener((changes) => {
      let refreshTokenChange = changes.refreshToken;
      if (refreshTokenChange) {
        if (refreshTokenChange.oldValue !== refreshTokenChange.newValue) {
          this.setState({ showLoginModal: false });
          navigate('/');
        }
      }
    });
    chrome.storage.local.get('refreshToken', (data) => {
      if (data.refreshToken) {
        this.setState({ showLoginModal: false });
        navigate('/');
      }
    });
  }

  authorize() {
    this.setState({ showLoginModal: true });
    this.buttonRef.current.disabled = true;
    const message = {
      oauthUrl: process.env.REACT_APP_AUTHORIZATION_URL + 'oauth',
      clientId: process.env.REACT_APP_CLIENT_ID,
      extensionVersion: process.env.REACT_APP_EXTENSION_VERSION
    };
    chrome.runtime.sendMessage(message);
    setTimeout(() => {
      if (this.buttonRef.current) {
        this.buttonRef.current.disabled = false;
      }
    }, 5000);
  }

  render() {
    return (
      <React.Fragment>
        <main className="login">
          <img src="assets/logos/logo.svg" className="logo" alt={process.env.REACT_APP_NAME + ' logo'}></img>
          <p>{process.env.REACT_APP_NAME} allows you to quickly add a transaction to your budget without having to leave your current tab.</p>
          <p>To start using {process.env.REACT_APP_NAME}, login with YNAB below.</p>
          <button onClick={() => this.authorize()}>Login with YNAB</button>
          <small>By authorizing {process.env.REACT_APP_NAME}, you are agreeing to our <a href="[WEBSITE_URL]/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</small>
        </main>
        <div className={this.state.showLoginModal ? 'modal-container visible' : 'modal-container'}>
          <aside className="login-window">
            <img src="assets/login-window.jpg" alt="YNAB log-in window"></img>
            <p>Please log into YNAB in the window that appears, select a budget and authorize {process.env.REACT_APP_NAME} to continue.</p>
            <button onClick={() => this.authorize()} ref={this.buttonRef}>Reopen window</button>
          </aside>
        </div>
      </React.Fragment>
    );
  }
}

export default Login;
