# OpenFin Sym Integration
The Symphony application shimmed with the SSF API and implemented in the OpenFin runtime.

## Overview
OpenFin has created an open-source project that allows anyone to run the Symphony chat client on OpenFin. This moves the client into a secure, interoperable and deployable format that can be more conducive for enterprises that already leverage OpenFin for their own applications. 

## Notes
- API implementations are in progress.  APIs are working off of what is defined here: https://symphonyoss.atlassian.net/wiki/display/WGDWAPI/Proposed+Standard+API+Specifications

## Development Setup
- Install the [OpenFin CLI Tool](https://github.com/openfin/openfin-cli) globally `npm install -g openfin-cli`
- `npm install`
- `npm run build`
- `npm start`
- `openfin -l`
- To target local files for development, replace the applicable mentions of `https://cdn.openfin.co/demos/symphony-of/` with `http://localhost:8080/`: 
~~~~
    1. 4 mentions in the `app.json`
    2. The `targetUrl.js` file
~~~~

## Production Setup
- Host the repo on your web server
- Change the url `app.json` to point to your company POD url (i.e. `https://MyCorporation.symphony.com`)
- Replace the mentions of `https://cdn.openfin.co/demos/symphony-of/` with the address to your web server: 
~~~~
    1. 4 mentions in the `app.json`
    2. The `targetUrl.js` file
~~~~
- `npm run build`
- generate an [OpenFin Installer](https://install.openfin.co/) pointing at the app.json file or use another [deployment option](https://openfin.co/options/)
- (optional) Notifications can be customized in the notification.html file

