
/*
  core symphony API
*/

window.SYM_API = {
    Notification:Notify,
    ScreenSnippet,

    setBadgeCount:function(number) {
        console.log("SSF Badgecount " + number);
        let win = fin.desktop.Window.getCurrent();
        if (number > 0) {
            let n = number > 9 ? '9+' : number;
            win.updateOptions({ icon: 'http://localhost:8080/icon/icon' + n + '.png' },() => {win.flash();},() => {console.log("update options failed");});
//            win.flash();
        } else {
            win.updateOptions({ icon: 'http://localhost:8080/icon/symphony.png' });
        };
    },
    activate:function() {
        console.log("SSF Activate!");
        let win = fin.desktop.Window.getCurrent();
        win.updateOptions({ icon: 'http://localhost:8080/icon/symphony.png' });
        fin.desktop.Window.getCurrent().bringToFront();
    },
    //undoced
    registerLogger:function() {
        console.log("SSF registerLogger!!");
    },
    registerBoundsChange:function(callback) {
        console.log("SSF boundschange!")
        let cb = callback;
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

//add handling for navigation outside of symphony
let app = fin.desktop.Application.getCurrent();
app.addEventListener("window-navigation-rejected",(obj) => {
  fin.desktop.System.openUrlWithBrowser(obj.url);
});
