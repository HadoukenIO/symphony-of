# OpenFin Sym Integration
The Symphony application shimmed with the SSF API and implemented in the OpenFin runtime.

## Notes
- This uses the public POD (my.symphony.com) to point to a company POD, repoint the start URL in the app.json.
- API implementations are in progress.  APIs are working off of what is defined here: https://symphonyoss.atlassian.net/wiki/display/WGDWAPI/Proposed+Standard+API+Specifications

## Setup
- `npm install`
- concatenate files into bundle/bundle.js with `npm run build`
- `npm start`
- `openfin -l app.json`
