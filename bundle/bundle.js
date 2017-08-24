(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.open = require('./window.js');
const Notify = require('./notify.js');

console.log('note in main', Notify)

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

},{"./notify.js":2,"./window.js":3}],2:[function(require,module,exports){
/*
* Class representing a Symphony notification
*/

module.exports = class Notify {

    constructor(title,options){
        console.log("SSF Notify " + JSON.stringify(title) + JSON.stringify(options));
        let msg = options;
        console.log('options', options)
        msg.title =  title;
        let app = fin.desktop.Application.getCurrent();
        this.eventListeners = {};
        this.notification = new window.fin.desktop.Notification({
            url: "http://localhost:8080/notification.html",
            message: msg,
            onClick: () => {
                app.window.setAsForeground();
            }
        });
        this._data = options.data || null;
    }

    static get permission(){
        return "granted";
    }

    get data(){
        return this.data;
    }

    close(cb){
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        console.log('add event listener', event, cb);
        this.eventListeners[event] = cb; // NEED THIS FOR REMOVE ALL... ASSUMES ONLY ONE CB PER EVENT... 
        // ADD ON SYSTEM? WINDOW? GETS CALLED WITH CLICK CLOSE AND ERROR AUTOMATICALLY... THIS FUNCTIONALITY SHOULD BE ON NOTIFICATION OBJECT
        fin.desktop.System.addEventListener(event, cb, () => {
            console.log("The registration was successful");
        }, function (err) {
            console.log("failure: " + err);
        });
    }

    removeEventListener(event, cb){
        fin.desktop.System.removeEventListener(event, cb, () => {
            console.log("The removal was successful");
            delete this.eventListeners[event];
        }, function (err) {
            console.log("failure: " + err);
        });
    }

    removeAllEvents(){
        // NEEDS TO BE TESTED
        Object.keys(this.eventListeners).forEach(key => removeEventListener(key, this.eventListeners.key))
    }

    destroy(){
        // How is this different from close?
    }
}
},{}],3:[function(require,module,exports){
/* override window.open to fix name issue */
var originalOpen = window.open;
module.exports = (...args) => {
   let w = originalOpen.apply(this, args);
    //Try catch for cross domain safeguard
    try {
       w.name = args[1];
     } catch (e) {
        console.log(e)
     }

     return w;
}
},{}]},{},[1]);
