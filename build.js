const { exec } = require('child_process');
const fs = require('fs');

const env = process.argv[2]
const port = process.argv[3] || '8080'
const isLocalBuild = env === 'local';
const isStagingBuild = env === 'staging';
const version = require('./package.json').version;
const isProdBuild = !(isLocalBuild || isStagingBuild);

let targetUrl;
let launchAppUuid;

// NEED TO UPDATE VERSION FUNCTION IN MAIN.JS SOMEWHERE IN BUILD PROCESS

switch (env) {
    case 'staging': {
        targetUrl = 'https://cdn.openfin.co/demos/symphony-of-staging/';
        launchAppUuid = 'Symphony-OpenFin-Landing-Staging';
    }
    break;
    case 'local': {
        targetUrl = `http://localhost:${port}/`;
        launchAppUuid = 'Symphony-OpenFin-Landing-Local';
    }
    break;
    case 'prod':
    default: {
        targetUrl = 'https://cdn.openfin.co/demos/symphony-of/';
        launchAppUuid = 'Symphony-OpenFin-Landing';
    }
}

fs.writeFileSync('./buildtarget.js', `window.targetUrl='${targetUrl}';window.symphonyOpenFinVersion='${version}';`);

const fileString = "./buildtarget.js ./js/targetUrl.js ./js/window.js ./js/notify.js ./js/screensnippet.js ./js/main.js ./js/events.js ./js/connect.js > ./public/bundle.js";

exec('type ' + fileString, (error, stdout, stderr) => {
    if (error) {
        exec('cat ' + fileString, (error, stdout, stderr) => {
            if (error) {
              console.error(`build error: ${error}`);     
              return;
            } else {
                fs.unlinkSync('./buildtarget.js');
            }
            
        });
    } else {
        fs.unlinkSync('./buildtarget.js');
    }
});

if (isLocalBuild) {
    let app = require('./public/app.json');
    let contentNavigation = app.startup_app.contentNavigation;
    
    app.startup_app.preload = `${targetUrl}bundle.js`;
    app.startup_app.url =  "https://openfin.symphony.com";
    contentNavigation.whitelist = contentNavigation.whitelist.filter(x=>!/localhost/.test(x))
    contentNavigation.whitelist.push(targetUrl+'*');
    app.startup_app.preload = `${targetUrl}bundle.js`;
    app.startup_app.name = `OpenFin-Symphony-Client-Local`;
    app.startup_app.uuid = `OpenFin-Symphony-Client-Local`;
    fs.writeFileSync('./public/local.json', JSON.stringify(app, null, '    '));
}


const launchAppUrl = `${targetUrl}symphony-launch.html`;
const launchAppDialogLogo = `${targetUrl}symphony-dialog.png`;

let app = require('./public/symphony-launch.json');
app.startup_app.url = launchAppUrl;
app.startup_app.uuid = launchAppUuid;
app.dialogSettings.logo = launchAppDialogLogo;
fs.writeFileSync('./public/symphony-launch.json', JSON.stringify(app, null, '    '));

console.log(`built env: ${targetUrl}`);