
/*
  core symphony API
*/
// document.addEventListener("DOMContentLoaded", event => {
//     console.log("DOM fully loaded and parsed");
//     let header = document.createElement('link');
//     header.rel = 'import';
//     header.href = 'http://localhost:8080/header.html';
//     document.body.insertBefore(header, document.body.firstChild);
// });

// document.addEventListener("DOMContentLoaded", event => {
//     console.log("DOM fully loaded and parsed");
//     let header = document.createElement('div');
//     header.innerHTML='<object type="text/html" data="http://localhost:8080/header.html" ></object>'
//     document.body.insertBefore(header, document.body.firstChild);
// });

window.SYM_API = {
    Notification:Notify,
    ScreenSnippet,
    
    setBadgeCount:function(number) {
        console.log("SSF Badgecount " + number);
        let win = fin.desktop.Window.getCurrent();      
        if (number > 0) {
            number = number > 9 ? '9+' : number;            
            win.updateOptions({ icon: 'http://localhost:8080/icon/icon' + number + '.png' });
            win.flash();
        } else {
            win.updateOptions({ icon: 'http://localhost:8080/symphony-symbol.png' });            
        };
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
