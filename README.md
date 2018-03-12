# OpenFin Sym Integration

*Please note OpenFin Sym Integration is currently in beta and unsupported by Symphony*

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
- Change the startup app url in `public/app.json` to point to your company POD url (i.e. `https://MyCORP.DOMAIN.COM`)
- Replace the mentions of `https://cdn.openfin.co/demos/symphony-of/` with the address to your web server: 
~~~~
    1. 5 mentions in the `public/app.json`
    2. The first line of the `public/bundle.js` file
~~~~
- Host the public folder on your web server
- Generate an [OpenFin Installer](https://install.openfin.co/) pointing at the `public/app.json` file or use another [deployment option](https://openfin.co/options/)
- (optional) Notifications can be customized in the notification.html file

## Testing
The client running in OpenFin is adding only a limited number of additions to the SSF API. These features pertain mainly to Windowing, Notifications, and a System Tray that exposes additional menu options to users. The client running in OpenFin is to have feature parity with the client running in Electron.

### Screen Layout
- Multiple Pop Out Windows
- Pin Chats in Main Window
- Rooms, Direct IM

### Features
The following comprises a list of client features that are validated when using OpenFin. 
<table>
<tr><th>Topic/Feature</th><th>Area</th><th>Tests</th></tr>
<tr><td>Windowing</td>
<td><ul>
  <li>IMs</li><li>Multi User IMs</li><li>Rooms</li><li>Inbox</li>
</ul></td>
<td><ul>
  <li>Min/Max/Restore</li><li>Resizable</li><li>Pop Out of main Window</li><li>Save location on close/restart</li><li>Main window w/ pinned chats</li>
</td></tr>
<tr><td>Notifications</td>
<td><ul>
  <li>IMs</li><li>Rooms</li><li>Signals</li>
</ul></td>
<td><ul>
  <li>Flashing / Badges</li><li>Color customization</li><li>Persistence</li><li>Sound</li><li>Navigation to Chats</li>
</td></tr>
<tr><td>IM/Chats</td>
<td><ul>
  <li>IMs</li><li>Rooms</li>
</ul></td>
<td><ul>
  <li>Create new IMs</li><li>Create new Rooms</li><li>Create new multi user IMs</li><li>Adding Attachments</li><li>Screen Snippet tool</li><li>Emojis</li><li>Chimes</li><li>Send Requests</li><li>Search for Users</li><li>Message Formatting</li><li>Folders</li><li>Spell Check*</li>
</td></tr>
<tr><td>IM/General Preferences</td><td></td>
<td><ul>
  <li>Display Settings</li><li>Themes</li>
</td></tr>
<tr><td>Signals</td><td></td>
<td><ul>
  <li>Ensure compatibility</li><li>Notifications / Badges / Flashing</li>
</td></tr>
<tr><td>Applications</td><td></td>
<td><ul>
  <li>Ensure compatibility</li>
</td></tr>
<tr><td>System Tray</td><td></td>
<td><ul>
  <li>Launch on Startup</li><li>Always on Top</li><li>Close on Exit</li><li>Quit</li>
</td></tr>
<tr><td>Inbox</td><td></td>
<td><ul>
  <li>Ensure compatibility</li><li>Navigation to chats</li><li>Sort / Filter</li><li>Quit</li>
</td></tr>
<tr><td>Audio / Video</td><td></td>
<td><ul>
  <li>Video / Phone Conferencing</li><li>Screen Sharing*</li>
</td></tr>
</table>

(*) Currently not supported

## Memory Consumption
The following document highlights the memory consumption of the client running in OpenFin. The analysis is comprised of the following use cases:
* Initial App Startup
* Message Load
* Multi Window Open/Close
* Duration

Memory numbers gathered via Task Manager.

**Environment Variables**
<table>
<tr><th></th><th>OpenFin</th></tr>
<tr><td>OS</td><td>Windows 10</td>
<tr><td>Version</td><td>8.56.27.75</td>
<tr><td>Image Type</td><td>32-Bit</td>
</table>

**Process Memory**
<table>
<tr><th></th><th>Initial Startup (3 windows)</th><th>100+  Messages</th><th>Open/Close (10 Windows)</th><th>5+ Hrs 
 Running</th></tr>
<tr><td>OpenFin</td><td>362MB</td><td>384MB</td><td>428MB</td><td>362MB</td>
</table>

## Release Notes
### v1.0.18
**Notifications**
* Ability to configure desktop Notification positions
* New Notifications replace existing Notifications from existing chats / rooms
* Cleaned up Notification look and feel

**Multi Pod Support**
* Introduced ability to set up multiple Pods to a single instance

### v0.0.37
**System Tray Menu**

Added a System Tray menu that enables users access to the following features:
* Launch on Startup
* Always on Top
* Close on Exit
* Quit Application

**Resolved Issues**
* Resolved an issue where pop out windows were not retaining their position on restart
* Resolved issue where room notifications contained HTML
* Resolved issue where clicking a notification did not bring the app into focus or restore it

## Roadmap
* Launch pop out chat windows on Notification Clicks
* Spell Check Support
* Screen Share Support
