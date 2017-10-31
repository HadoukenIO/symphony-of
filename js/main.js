
/*
  core symphony API
*/

window.SYM_API = {
    Notification: Notify,
    ScreenSnippet,

    setBadgeCount:function(number) {
        let win = fin.desktop.Window.getCurrent();
        if (number > 0) {
            let n = number > 9 ? '9+' : number;
            win.updateOptions({ icon: `${targetUrl}icon/icon${n}.png` },() => {win.flash();},() => {console.log("update options failed");});
        } else {
            win.updateOptions({ icon: `${targetUrl}/icon/symphony.png` });
        };
    },
    activate:function() {
        let win = fin.desktop.Window.getCurrent();
        win.updateOptions({ icon: `${targetUrl}/icon/symphony.png` });
        fin.desktop.Window.getCurrent().bringToFront();
    },
    //undoced
    registerLogger:function() {
        console.log("SSF registerLogger!!");
    },
    registerBoundsChange:function(callback) {
        let cb = callback;
        fin.desktop.Application.getCurrent().addEventListener("window-created", obj => {
            if(obj.name !== obj.uuid && !obj.name.includes('Notifications') && obj.name !== 'queueCounter') {    
                fin.desktop.Window.wrap(obj.uuid, obj.name).addEventListener("bounds-changed", win => {
                    for (let pop of Object.keys(window.popouts)) {
                        if(window.popouts[pop].name === obj.name) {
                            window.popouts[pop] = win;
                        }
                    }
                    localStorage.setItem('wins', JSON.stringify(window.popouts));                                 
                    cb({x:win.left,
                        y:win.top,
                        width:win.width,
                        height:win.height,
                        windowName:win.name
                    });
                })
            }
        });
    },
    getVersionInfo: function() {
        return new Promise((resolve, reject) => {
            // Where to keep version information?
            let version = {
                containerIdentifier: "SymphonyOpenFin",
                containerVer: "0.0.1",
                apiVer: "1.0.0"
            }
            resolve(version)
        })
    }
}

window.ssf = window.SYM_API;
window.ssf.activate();
