# OpenFin Sym Integration
This project implements the SSF API standard to integrate chat with the OpenFin OS. The SSF API is defined by the Symphony Software Foundation [Desktop Wrapper Working Group](https://symphonyoss.atlassian.net/wiki/spaces/WGDWAPI/pages).  Other implementations of the API include the [Symphony Electron](https://github.com/symphonyoss/SymphonyElectron/) project and [ContainerJS](https://github.com/symphonyoss/ContainerJS).


## Notes
- API implementations are in progress.  APIs are working off of what is defined here: https://symphonyoss.atlassian.net/wiki/display/WGDWAPI/Proposed+Standard+API+Specifications

## Development Setup
- Install the [OpenFin CLI Tool](https://github.com/openfin/openfin-cli) globally `npm install -g openfin-cli`
- `npm install`
- `npm run build local`
- `npm start`
- `openfin -l -c public/local.json`

## Production Setup
- `npm run build`
- Change the startup app url in `public/app.json` to point to your company POD url (i.e. `https://MyCorporation.symphony.com`)
- Replace the mentions of `https://cdn.openfin.co/demos/symphony-of/` with the address to your web server: 
~~~~
    1. 5 mentions in the `public/app.json`
    2. The first line of the `public/bundle.js` file
~~~~
- Host the public folder on your web server
- generate an [OpenFin Installer](https://install.openfin.co/) pointing at the `public/app.json` file or use another [deployment option](https://openfin.co/options/)
- (optional) Notifications can be customized in the notification.html file