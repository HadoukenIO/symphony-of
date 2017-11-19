const { exec } = require('child_process');
const fs = require('fs');

const env = process.argv[2]
const port = process.argv[3] || '8080'
const islocalbuild = env === 'local';

let targetUrl;

switch (env) {
    case 'staging': targetUrl = 'https://cdn.openfin.co/demos/symphony-of-staging/'
    break;
    case 'local': targetUrl = `http://localhost:${port}/`;
    break;
    default: targetUrl = 'https://cdn.openfin.co/demos/symphony-of/';
}

fs.writeFileSync('./buildtarget.js', `window.targetUrl='${targetUrl}';`);

const fileString = "./buildtarget.js ./js/targetUrl.js ./js/window.js ./js/notify.js ./js/screensnippet.js ./js/main.js  ./js/events.js > ./public/bundle.js";

// if (false)
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

if (islocalbuild) {
    let app = require('./public/app.json');
    let contentNavigation = app.startup_app.contentNavigation;
    
    app.startup_app.preload = `${targetUrl}bundle.js`
    contentNavigation.whitelist = contentNavigation.whitelist.filter(x=>!/localhost/.test(x))
    contentNavigation.whitelist.push(targetUrl+'*');
    app.startup_app.preload = `${targetUrl}bundle.js`;
    fs.writeFileSync('./public/local.json', JSON.stringify(app, null, ' '));
}

console.log(`built env: ${targetUrl}`);