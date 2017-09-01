/* override window.open to fix name issue */
var originalOpen = window.open;
window.open = (...args) => {
   let w = originalOpen.apply(this, args);
    //Try catch for cross domain safeguard
    try {
       w.name = args[1];
     } catch (e) {
        console.log(e)
     }

     return w;
}/*
* Class representing a Symphony notification
*/

class Notify {

    constructor(title,options){
        console.log("SSF Notify " + JSON.stringify(title) + JSON.stringify(options));
        let msg = options;
        msg.title =  title;
        let app = fin.desktop.Application.getCurrent();
        this.eventListeners = [];
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

    close(cb) {
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        console.log('SSF Notify Event Listener', event, cb);
        // Utilize the OF notification object to accomplish - can re-write to accomplish multiple cb / listeners per event 
        this.eventListeners.push(event)

        if(event === 'click') {
            this.notification.noteWin.onClick = cb
        } else if(event === 'close') {
            this.notification.noteWin.onClose = cb
        } else if(event === 'error') {
            this.notification.noteWin.onError = cb
            console.log(this.notification.noteWin.onError)
        }

        // this.eventListeners[event] = cb; // NEED THIS FOR REMOVE ALL... ASSUMES ONLY ONE CB PER EVENT... 
        // // ADD ON SYSTEM? WINDOW? GETS CALLED WITH CLICK CLOSE AND ERROR AUTOMATICALLY... THIS FUNCTIONALITY SHOULD BE ON NOTIFICATION OBJECT
        // fin.desktop.System.addEventListener(event, cb, () => {
        //     console.log("The registration was successful");
        // }, function (err) {
        //     console.log("failure: " + err);
        // });
    }

    removeEventListener(event, cb){
        console.log('SSF Notify Event Listener Removed', event, cb);

        if(event === 'click') {
            this.notification.noteWin.onClick = () => {};
        } else if(event === 'close') {
            this.notification.noteWin.onClose = () => {};
        } else if(event === 'error') {
            this.notification.noteWin.onError = () => {};
        }


        // fin.desktop.System.removeEventListener(event, cb, () => {
        //     console.log("The removal was successful");
        //     delete this.eventListeners[event];
        // }, function (err) {
        //     console.log("failure: " + err);
        // });
    }

    removeAllEvents(){
        while(this.eventListeners.length) {
            removeEventListener(this.eventListeners.pop());
        }
    }

    destroy(){
        // How is this different from close?
    }
}
class ScreenSnippet {
    constructor() {
        this.data;
        this.flag = false;

        // THIS WOULD GET ALL SNIPPETS... IS THIS MEANT TO BE SINGLETON OR MORE THAN ONE INSTANCE?
        this.listener = (msg, uuid) => {
            this.data = msg;
        }

        fin.desktop.InterApplicationBus.subscribe('*', 'snippet', this.listener);
        // (msg, uuid) => {
        //     this.data = msg;
        // });
    }

    capture() {
        console.log('top flag', this.flag)
        if (this.flag) return;

        function launchNodeService(port) {
            console.log('lns')
            return new Promise((resolve, reject) => {
                fin.desktop.System.launchExternalProcess({
                    alias: 'nodeScreenSnippet',
                    arguments: 'ScreenSnippet/ScreenSnippet.js --port ' + 9696,
                    lifetime: 'window',
                    listener: function (result) {
                        console.log('the exit code', result.exitCode);
                    }
                }, (payload) => {
                    resolve(payload.uuid)
                }, (reason, error) => reject(reason, error));
            });
        };

        const waitForData = (resolve, uuid) => {
            if (!this.data) {
                setTimeout(() => waitForData(resolve, uuid),100);
            } else {
                console.log('external uuid', uuid)
                fin.desktop.System.terminateExternalProcess(uuid, 1, true, 
                    info => console.log("Termination result " + info.result), 
                    reason => console.log("failure: " + reason)
                )
        
                resolve(this.data)
            }
        }

        return launchNodeService()
        .then((uuid) => {
            console.log('this in prom chain', this);
            return new Promise ((resolve, reject) => {
                waitForData(resolve, uuid)
            })
        })
        .then(data => {
            fin.desktop.InterApplicationBus.unsubscribe('*', 'snippet', this.listener);
            console.log('flag1', this.flag)
            this.flag=true;
            console.log('flag2', this.flag)
            return data;
        })
        .catch((reason, err) => console.log(reason, err));
    }
}

/*
  core symphony API
*/
window.SYM_API = {
    Notification:Notify,
    ScreenSnippet,

        // let data;
        
        // // THIS WOULD GET ALL SNIPPETS... IS THIS MEANT TO BE SINGLETON OR MORE THAN ONE INSTANCE?
        // let listener = (msg, uuid) => {
        //     data = msg;
        // }

        // fin.desktop.InterApplicationBus.subscribe('*', 'snippet', listener);

        // function launchNodeService(port) {
        //     console.log('lns')
        //     return new Promise((resolve, reject) => {
        //         fin.desktop.System.launchExternalProcess({
        //             alias: 'nodeScreenSnippet',
        //             arguments: 'ScreenSnippet/ScreenSnippet.js --port ' + 9696,
        //             lifetime: 'persist',
        //             listener: function (result) {
        //                 console.log('the exit code', result.exitCode);
        //             }
        //         }, () => {
        //             resolve()
        //         }, (reason, error) => reject(reason, error));
        //     });
        // };

        // const waitForData = (resolve) => {
        //     if (!data) {
        //         setTimeout(() => waitForData(resolve),100);
        //     } else {
        //         resolve(data)
        //     }
        // }

        // return launchNodeService()
        // .then(() => console.log('node service is running'))
        // .then(() => {
        //     console.log('this in prom chain', this);
        //     return new Promise ((resolve, reject) => {
        //         waitForData(resolve)
        //     })
        // })
        // .then(data => {
        //     fin.desktop.InterApplicationBus.unsubscribe('*', 'snippet', listener)
        //     return data;
        // })
        // .catch((reason, err) => console.log(reason, err));


    // },
    setBadgeCount:function(number) {

        console.log("SSF Badgecount " + number);

        let win = fin.desktop.Window.getCurrent();        
        number = number > 9 ? 9 : number;
        if (number > 0) {
            win.updateOptions({ icon: 'http://localhost:8080/icon/icon' + number + '.png' });
            win.flash();
        } else {
            win.updateOptions({ icon: 'http://localhost:8080/symphony-symbol.png' });            
        }
        
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
