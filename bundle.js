window.targetUrl = `https://cdn.openfin.co/demos/symphony-of/`;
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

class Notify {

    constructor(title,options){
        let msg = options || {};
        msg.title =  title;
        let timeout = 5000;
        let app = fin.desktop.Application.getCurrent();        
        let onClick = () => app.getWindow().restore(() => {app.getWindow().setAsForeground();});
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            onClick = () => { 
                app.getWindow().restore(() => {app.getWindow().setAsForeground();});
                this.notification.close();
            }
        }
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            url: `${window.targetUrl}notification.html`,
            message: msg,
            onClick,
            timeout,
            opacity: 0.92
        });
        this._data = msg.data || null;
    }

    static get permission(){
        return "granted";
    }

    get data(){
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
        //     this.notification.noteWin.onClick = cb
        // } else if(event === 'close') {
        //     this.notification.noteWin.onClose = cb
        // } else if(event === 'error') {
        //     this.notification.noteWin.onError = cb
        }
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
            win.updateOptions({ icon: `${window.targetUrl}icon/icon${n}.png` },() => {win.flash();},() => {console.log("update options failed");});
        } else {
            win.updateOptions({ icon: `${window.targetUrl}icon/symphony.png` });
        };
    },
    activate:function() {
        let win = fin.desktop.Window.getCurrent();
        win.updateOptions({ icon: `${window.targetUrl}icon/symphony.png` });
        fin.desktop.Window.getCurrent().bringToFront();
    },
    //undoced
    registerLogger:function() {
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
let win = app.getWindow();

//Overwrite closing of application to minimize instead
win.addEventListener('close-requested',() => win.minimize());

//add handling for navigation outside of symphony
app.addEventListener("window-navigation-rejected", obj => {
    if (name==='main') {
        fin.desktop.System.openUrlWithBrowser(obj.url);
    }
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

window.addEventListener('load', () => {
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const waitForElement = (query, count, cb) => {
        let elements = document.querySelectorAll(query);  
        if(elements.length) {            
            cb(elements);
        } else {
            if(count<12) {
                count++;
                setTimeout(()=>waitForElement(query, count, cb),400)
            }
        }
    };
    const popoutsCheck = elements => {
        popsToOpen = [];
  
        Array.from(elements).forEach(el => {
            let userId = el.children[0] && el.children[0].attributes['1'] && el.children[0].attributes['1'].value;
            
            el.parentNode.parentNode.parentNode.addEventListener('click', () => {
                window.curWin = userId;
                if (window.popouts[userId] && !window.popouts[userId].hide) {
                    let popWin = fin.desktop.Window.wrap(window.popouts[userId].uuid, window.popouts[userId].name);
                    popWin.restore(() => {popWin.setAsForeground();});
                }
            })
  
            if(window.popouts[userId] && !window.popouts[userId].hide) {
                popsToOpen.push(el)
            };
        });
        async function openPopouts() {
            if(window.popouts['inbox'] && !window.popouts['inbox'].hide) {
                await timeout(1000);
            };
            for(let pop of popsToOpen) {
                pop.click();
                await timeout(400);
                document.getElementsByClassName('enhanced-pop-out')[0].click();
                await timeout(600);
            };
        };
        openPopouts();
    };
    const inboxCheck = elements => {
        Array.from(elements).forEach(el => {
            let userId = 'inbox';           
            el.addEventListener('click', () => {
                if (window.popouts[userId] && !window.popouts[userId].hide) {
                    let popWin = fin.desktop.Window.wrap(window.popouts[userId].uuid, window.popouts[userId].name);
                    popWin.restore(() => {popWin.setAsForeground();});
                }
            })

            async function openInbox() {
                el.click();
                await timeout(400);
                let dock = document.querySelector('#dock');
                dock.querySelector('.popout').click();
            };
  
            if(window.popouts['inbox'] && !window.popouts['inbox'].hide) {
                openInbox();
            }
        })
    }

    const inboxNavigation = element => {
        Array.from(element).forEach(el => {
            
            el.addEventListener('click', (e) => {
                if(e.target.className.includes('popout')){
                    let holdWin = window.curWin;
                    window.curWin = 'inbox';
                    setTimeout(() => {
                        window.curWin = holdWin
                    }, 300)
                };
                window.popouts = JSON.parse(localStorage.getItem('wins')) || {};                
                let target = e.target;
                let attr = target && target.attributes;
                let child = target && target.children && target.children[0];

                let userId = target.attributes && attr['1'] && attr['1'].value || 
                             target.children && child && child.attributes && child.attributes['1'] && child.attributes['1'].value;
                if (!userId) {
                    try {
                    let clicked =  e.target.parentNode.parentNode.parentNode.parentNode;
                    userId = clicked.attributes && clicked.attributes['1'] && clicked.attributes['1'].value;
                    } catch(e) {console.log(e)}
                };
                if (window.popouts[userId]) {
                    let popWin = fin.desktop.Window.wrap(window.popouts[userId].uuid, window.popouts[userId].name);
                    console.log(popWin);
                    popWin.restore(() => {popWin.setAsForeground();},e=>console.log(e));
                } else {
                    win.restore(() => {win.setAsForeground();});
                }
            })
        })
    
    };
    // remove 'x' that does nothing on click
    waitForElement('.close-module',0,el=>el[0].style.display = 'none');

    //Re-open popouts & inbox when app is restarted 
    waitForElement('button.toolbar-btn-inbox',0,el=> inboxCheck(el));    
    waitForElement('.navigation-item-name',0,el=> popoutsCheck(el));

    // Navigation from Inbox
    waitForElement('#dock',0,el=> inboxNavigation(el));
});