
/*
  core symphony API
*/

window.SYM_API = {
    Notification: Notify,
    ScreenSnippet,

    setBadgeCount:function(number) {
        let win = fin.desktop.Application.getCurrent().getWindow();
        if (number > 0) {
            let n = number > 9 ? '9+' : number;
            win.updateOptions({ icon: `${fin.symphony.settings.targetUrl}icon/icon${n}.png` },() => {win.flash();},() => {console.log("update options failed");});
        } else {
            win.updateOptions({ icon: fin.symphony.settings.iconUrl });
        };
    },
    activate:function(windowName) {
        var app = fin.desktop.Application.getCurrent();
        var ofWin = fin.desktop.Window.wrap(app.uuid, windowName);

        if (windowName === 'main') {
            ofWin = app.getWindow();
        }

        ofWin.getState(state => {
            if (state === 'minimized') {
                ofWin.restore(() => {ofWin.setAsForeground();},e=>console.log(e));                            
            } else {
                ofWin.setAsForeground();    
            }
        })
    },
    //undoced
    registerLogger:function() {
    },
    registerBoundsChange:function(cb) {
        window.saveBounds = cb;
    },
    getVersionInfo: function() {
        return new Promise((resolve, reject) => {
            fin.desktop.System.getRvmInfo(function (rvmInfo) { 
                let versionInfo = {
                    containerIdentifier: "SymphonyOpenFin",
                    siteRevision: fin.symphony.revision,
                    containerVersion: fin.symphony.version,
                    runtimeVersion: fin.desktop.getVersion(),
                    rvmVersion: rvmInfo.version,
                    apiVer: "1.0.0"
                }
                resolve(versionInfo);
            });
        })
    },
    registerActivityDetection: function (throttle, callback) {
        let keepActive;

        function whilteActive() {
            console.log("User active - whilteActive called.");
            callback(1);
        }

        fin.desktop.System.addEventListener("idle-state-changed", event => {
            console.log(`Idle State Changed: ${event.isIdle}`);
            if (!event.isIdle) {
                callback(1);
                keepActive = setInterval(whilteActive, 60000);
            } else {
                console.log("Interval cleared.");
                clearInterval(keepActive);
            }
        });
        callback(1);
        keepActive = setInterval(whilteActive, 60000);
    }
}

window.ssf = window.SYM_API;
