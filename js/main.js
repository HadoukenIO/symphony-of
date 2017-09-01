
class ScreenSnippet {
    constructor() {
        this.data;
        this.flag = false;

        // THIS WOULD GET ALL SNIPPETS... IS THIS MEANT TO BE SINGLETON OR MORE THAN ONE INSTANCE?
        this.listener = msg => {
            this.data = msg;
        }

        fin.desktop.InterApplicationBus.subscribe('*', 'snippet', this.listener);
    }

    capture() {
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
                // Terminate the node screen snippet process
                fin.desktop.System.terminateExternalProcess(uuid, 1, true, 
                    info => console.log("Termination result " + info.result), 
                    reason => console.log("failure: " + reason)
                )
        
                resolve(this.data)
            }
        }

        return launchNodeService()
        .then((uuid) => {
            return new Promise ((resolve, reject) => {
                waitForData(resolve, uuid)
            })
        })
        .then(data => {
            fin.desktop.InterApplicationBus.unsubscribe('*', 'snippet', this.listener);
            this.flag=true;
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
    setBadgeCount:function(number) {

        console.log("SSF Badgecount " + number);

        let win = fin.desktop.Window.getCurrent();        
        number = number > 9 ? 9 : number;
        if (number > 0) {
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
