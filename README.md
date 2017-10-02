# OpenFin Sym Integration
The Symphony application shimmed with the SSF API and implemented in the OpenFin runtime.

## Notes
- API implementations are in progress.  APIs are working off of what is defined here: https://symphonyoss.atlassian.net/wiki/display/WGDWAPI/Proposed+Standard+API+Specifications

## Development Setup - use develop branch for local development
- `npm install`
- develop
- concatenate files into bundle/bundle.js with `npm run build`
- `npm start`
- `openfin -l -c dist/app.json`

## Production Setup
- Host the assets in the `dist` folder on your web server
- Change the url `app.json` to point to your company POD url (i.e. `https://MyCorporation.symphony.com`)
- Replace the mentions of `MYWEBSERVER` with the address to your web server where the `dist` folder will be placed: 
~~~~
    1. 3 mentions in the `app.json`
    2. The top of the `bundle.js` file
    3. line 62 of the `notification.html` 
~~~~
- generate an [OpenFin Installer](https://install.openfin.co/) or use another [deployment option](https://openfin.co/options/)
- (optional) notifications can be customized in the notification.html file

