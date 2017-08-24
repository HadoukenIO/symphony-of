
/*
  core symphony API
*/
window.SYM_API = {
    Notification:Notify,
    setBadgeCount:function(Number) {
        console.log("SSF Badgecount " + Number);
    },
    ScreenSnippet:function(cb) {
        console.log("SSF Screen Snippet requested");
        fin.desktop.Window.getCurrent().getSnapshot(base64Snapshot => {
            console.log('Window Snapshot Taken');
            if(cb) {
                cb(base64Snapshot);
            }
        })
    },
    activate:function() {
        console.log("SSF Activate!");
        fin.desktop.Window.getCurrent().bringToFront();
    },
    //undoced
    registerLogger:function() {
        console.log("SSF registerLogger!!");
    },
    registerBoundsChange:function(callback) {
        console.log("SSF boundschange!")
        var cb = callback;
        fin.desktop.Window.getCurrent().addEventListener("bounds-changed", obj => {
        cb({x:obj.left,
            y:obj.top,
            width:obj.width,
            height:obj.height,
            windowName:obj.name});
        })
    },
    getVersionInfo: function() {
        return new Promise((resolve, reject) => {
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
