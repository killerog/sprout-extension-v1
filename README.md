# Sprout for YNAB V1

![Sprout for YNAB logo](./public/assets/logos/logo-128.png "Sprout for YNAB logo")

Sprout for YNAB is a browser extension that allows a YNAB (You Need a Budget) user to add a transaction to their budget without leaving their current tab.

## Technologies used
- React 16
- Reach Router
- Fuse.js

## Install
```
npm install
```

## Setup
### Client ID
- On https://app.ynab.com, go to Settings -> Developer Settings and create a new OAuth application. 
  - Do not enable default budget selection
  - Don't worry about adding redirect URI(s) at this point
- Save the app and copy the client ID and replace `[CLIENT_ID]` in .env.default (`REACT_APP_CLIENT_ID`) with the client ID and save it as .env

### Worker URL
Change any references to `[WORKER_URL]` in the code to the worker's URL

- .env (`REACT_APP_AUTHORIZATION_URL`)

`http://localhost:8787` is the default address for the worker in local mode

### Website URL
Change any references to `[WEBSITE_URL]` in the code to the website's URL

## Building
### Complete Build
```
npm run build
```
This will build both manifest V2 and manifest V3 versions of the extension in `build/v2` and `build/v3`.
### V2 Manifest Build
```
npm run build:v2
```
This will build the extension with a V2 manifest in `build/v2`.
### V3 Manifest Build
```
npm run build:v3
```
This will build the extension with a V3 manifest.

## Running locally
### Chromium Browsers
- Build the extension per instructions above
- Go to Extensions page in browser (e.g. `chrome://extensions/`)
  - Enable Developer Mode
  - Click "Load Unpacked" and select the build directory
  - Take note of the Extension ID
- On https://app.ynab.com, go to Settings -> Developer Settings -> your OAuth application
  - Add a Redirect URI in the following format: `https://[EXTENSION_ID].chromiumapp.org`
- The extension should now be ready for use locally. Make sure your worker is live whether local or remote.

### Firefox
- Build the extension per instructions above
- Go to Debugging View in browser (e.g. `about:debugging#/runtime/this-firefox`)
  - Click "Load Temporary Add-on" and select the manifest in build directory
  - Click Inspect
  - In the console, enter `browser.identity.getRedirectURL()` and take note of the URL
    - This will change every time in between the browser closing and re-opening. These instructions must be repeated every time Firefox is opened
- On https://app.ynab.com, go to Settings -> Developer Settings -> your OAuth application
  - Add the URL from the console as a Redirect URI
- The extension should now be ready for use locally. Make sure your worker is live whether local or remote.

## Preparing for Distribution
Place the contents of the `build/v2` or `build/v3` directories into a ZIP file, depending on which manifest version you've built. That ZIP file can then be uploaded to browser extension storefronts for distribution.

### Redirect URIs
Just like for running locally, redirect URIs for prod-ready builds will need to be added to your OAuth application in YNAB in order for the extension to work in production. This is only necessary for your first publish.

#### Chromium Browsers
The CRX ID in your dashboards will be the ID you can use to add as a redirect URI in the `https://[EXTENSION_ID].chromiumapp.org` format.

#### Firefox
You may need to run `browser.identity.getRedirectURL()` in the console of an installed version of your prod extension after publish in order to get the redirect URI to add to the list of redirect URIs on YNAB.

## License
MIT

