const { exec } = require('child_process');

const fileString = "./js/targetUrl.js ./js/window.js ./js/notify.js ./js/screensnippet.js ./js/main.js  ./js/events.js > ./bundle.js";

exec('type ' + fileString, (error, stdout, stderr) => {
    if (error) {
        exec('cat ' + fileString, (error, stdout, stderr) => {
            if (error) {
              console.error(`build error: ${error}`);     
              return;
            }
        });
    }
});