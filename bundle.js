const targetUrl = `http://localhost:8081/`
/* override window.open to fix name issue */
var originalOpen = window.open;
window.popouts = JSON.parse(localStorage.getItem('wins')) || {};
window.curWin;

window.open = (...args) => {
  let w = originalOpen.apply(this, args);
   //Try catch for cross domain safeguard
  if(!w.name.includes('Notifications') && w.name !== 'queueCounter') {
      
    try {
        w.name = args[1];
      } catch (e) {
        console.log(e)
      }
  }
    return w;
}
/*
* Class representing a Symphony notification
*/

let holdNote = window.Notification;

class Notify {

    constructor(title,options){
        // console.log('NOTIFY OPTIONS:', options)
        let msg = options;
        msg.title =  title;
        // let app = fin.desktop.Application.getCurrent();
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            // url: `http://localhost:5555/creation.html`,
            // url: `${targetUrl}notification.html`,
            url: `${targetUrl}blankNote.html`,
            message: msg,
            onClick: () => {
                app.getWindow().restore(() => {app.getWindow().setAsForeground();});
            },
            onShow: () => {
                console.log('SUCCESS', msg.body)
            },
            onError: (e) => {
                console.log('Error', e, msg.body)
            },
            timeout: 5000,
            opacity: 0.5
        });
        this._data = options.data || null;
    }

    static get permission(){
        console.log('permission called')
        return "granted";
    }

    get data(){
        console.log('called get data')
        return this.data;
    }

    close(cb) {
        // This gets called immediately on a new notification...so commented out for now.
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        // Utilize the OF notification object to accomplish
        // this.eventListeners.push(event)

        // if(event === 'click') {
        //     // this.notification.noteWin.onClick = cb
        // } else if(event === 'close') {
        //     this.notification.noteWin.onClose = cb
        // } else if(event === 'error') {
        //     this.notification.noteWin.onError = cb
        // }
    }

    removeEventListener(event, cb){
        // if(event === 'click') {
        //     // this.notification.noteWin.onClick = () => {};
        // } else if(event === 'close') {
        //     // this.notification.noteWin.onClose = () => {};
        // } else if(event === 'error') {
        //     // this.notification.noteWin.onError = () => {};
        // }
    }

    removeAllEvents(){
        // while(this.eventListeners.length) {
        //     removeEventListener(this.eventListeners.pop());
        // }
    }

    destroy(){
        // How is this different from close?
    }
}

/*
* Class representing a Symphony screen snippet
*/

let holdChrome = chrome;

class ScreenSnippet {
    constructor() {
        this.id = Math.floor(Math.random()*10000);
        this.snippetData = new Promise(resolve => {
            fin.desktop.InterApplicationBus.subscribe('*', 'snippet' + this.id, msg => {
                resolve(msg);
            });
        });
    }

    capture() {             
        function getPort() {
            return new Promise((resolve, reject) => {
                holdChrome.desktop.getDetails(d => resolve(d.port));
            });
        }

        function launchSnippetTool(port, id) {
            return new Promise((resolve, reject) => {
                fin.desktop.System.launchExternalProcess({
                    alias: 'ScreenSnippet',
                    arguments: port + ' OpenFin-Symphony-udbrf2z9sehilik9 snippet' + id,
                    lifetime: 'window'
                }, () => {
                    resolve()
                }, (reason, error) => reject(reason, error));
            });
        };

        return getPort()
        .then(port => launchSnippetTool(port, this.id))
        .then(() => this.snippetData)
        .then(data => {
            return { type: 'image/jpg;base64', data }
        })
        .catch((reason, err) => console.log(reason, err));
    }
}

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
let app = fin.desktop.Application.getCurrent();

//add handling for navigation outside of symphony
app.addEventListener("window-navigation-rejected", obj => {
  fin.desktop.System.openUrlWithBrowser(obj.url);
});

// Add logic to keep track of window positioning
app.addEventListener("window-created", obj => {
    let childWin = fin.desktop.Window.wrap(obj.uuid, obj.name)
    if(obj.name !== obj.uuid && !obj.name.includes('Notifications') && obj.name !== 'queueCounter') {
        let winId = window.curWin;
        if(window.popouts[winId] && window.popouts[winId].left) {
            window.popouts[winId].name = obj.name;
            window.popouts[winId].hide = false;
            const { left, top, width, height } = window.popouts[winId];
            
            childWin.setBounds(left, top, width, height);
        } else if(winId) {
            window.popouts[winId] = { name: obj.name };
            localStorage.setItem('wins', JSON.stringify(window.popouts));                 
        }
        childWin.addEventListener('close-requested',() => {
            for (let pop of Object.keys(window.popouts)) {
                if(window.popouts[pop] && window.popouts[pop].name === obj.name) {
                    window.popouts[pop].hide = true;
                    localStorage.setItem('wins', JSON.stringify(window.popouts));            
                }
            }
            childWin.close(true);
        })
    }
});

app.addEventListener("window-closed", obj => {
    if(obj.name !== obj.uuid && !obj.name.includes('Notifications') && obj.name !== 'queueCounter') {        
        setTimeout(()=> {
            for (let pop of Object.keys(window.popouts)) {
                if(window.popouts[pop] && window.popouts[pop].name === obj.name) {
                    window.popouts[pop].hide = true;
                    localStorage.setItem('wins', JSON.stringify(window.popouts));            
                }
            }
        },1000)
    }
});

//Overwrite closing of application to minimize instead
let win = app.getWindow();
win.addEventListener('close-requested',() => win.minimize());


window.addEventListener('load', () => {
    const waitForElement = (className, count, cb) => {
        let elements = document.getElementsByClassName(className);  
        if(elements.length) {            
            cb(elements)
        } else {
            if(count<12) {
                count++;
                setTimeout(()=>waitForElement(className, count, cb),400)
            }
        }
    };
    // TO DO - SET A FLAG SO THIS DOESNT HAPPEN AFTER INIT TIME (may need to be more than 1?)
    const popoutsCheck = elements => {
        popsToOpen = [];
  
        Array.from(elements).forEach(el => {
            let userId = el.children[0] && el.children[0].attributes['1'] && el.children[0].attributes['1'].value;
            
            el.parentNode.parentNode.parentNode.addEventListener('click', () => {
                window.curWin = userId;
            })
  
            if(el.children[0] && window.popouts[userId] && !window.popouts[userId].hide) {
                popsToOpen.push(el)
            }
        })
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        async function openPopouts() {
            for(let pop of popsToOpen) {
                pop.click();
                await timeout(400);
                document.getElementsByClassName('enhanced-pop-out')[0].click();
                await timeout(600);
            }
        }  
        openPopouts();
    }
    // remove 'x' that does nothing on click
    waitForElement('close-module',0,el=>el[0].style.display = 'none');

    //Re-open popouts when app is restarted 
    waitForElement('navigation-item-name',0,el=> popoutsCheck(el));
});