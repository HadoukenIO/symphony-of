# OpenFin Sym Integration
The Symphony application shimmed with the SSF API and implemented in the OpenFin runtime.

## Notes
- API implementations are in progress.  APIs are working off of what is defined here: https://symphonyoss.atlassian.net/wiki/display/WGDWAPI/Proposed+Standard+API+Specifications

## Development Setup
- Install the [OpenFin CLI Tool](https://github.com/openfin/openfin-cli) globally `npm install -g openfin-cli`
- `npm install`
- `npm run build`
- `npm start`
- `openfin -l`

## Production Setup
- Host the repo on your web server
- Change the url `app.json` to point to your company POD url (i.e. `https://MyCorporation.symphony.com`)
- Replace the mentions of `http://localhost:8080/` with the address to your web server: 
~~~~
    1. 5 mentions in the `app.json`
    2. The `targetUrl.js` file
~~~~
- `npm run build`
- generate an [OpenFin Installer](https://install.openfin.co/) or use another [deployment option](https://openfin.co/options/)
- (optional) Notifications can be customized in the notification.html file

