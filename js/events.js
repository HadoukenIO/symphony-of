let app = fin.desktop.Application.getCurrent();
let win = app.getWindow();
window.rateLimiter = false;
window.popoutChanges = [];
//Overwrite closing of application to minimize instead

win.addEventListener('close-requested',() => {
    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
    if(window.popouts.closeOnExit) {
        fin.desktop.Application.getCurrent().close(true);
    } else {
        fin.desktop.Application.getCurrent().getWindow().minimize();        
    }
});

//add handling for navigation outside of symphony
app.addEventListener("window-navigation-rejected", obj => {
    if (name==='main') {
        fin.desktop.System.openUrlWithBrowser(obj.url);
    }
});

// Things to do ONLY once and ONLY in the main window:
window.addEventListener('load', () => {
    let currentWindow = fin.desktop.Window.getCurrent();
    window.once = false;
    if(currentWindow.uuid===currentWindow.name && !window.once) {
        //navigate to converation from main window on notification click
        window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};    
        fin.desktop.InterApplicationBus.subscribe("*", "note-clicked", streamId => {
            let elements = document.querySelectorAll('.navigation-item-name');
            Array.from(elements).forEach(el => {
                let userId = el.children[0] && el.children[0].attributes['1'] && el.children[0].attributes['1'].value;
                if (!userId) { 
                    userId = el.children[0] && el.children[0].innerText;
                };
                if (userId === window.popouts[streamId].userId) {
                    el.parentNode.parentNode.parentNode.click();
                    window.winFocus(currentWindow);
                }
            });
        });
        // set main window state
        if (window.popouts.main) {
            const { left, top:tiptop, width, height } = window.popouts.main; 
            currentWindow.setBounds(left, tiptop, width, height);
        }
        // save main window state
        currentWindow.addEventListener("bounds-changed", win => {
            if(!window.rateLimiter) {
                window.rateLimiter = true;
                setTimeout(()=> {
                    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
                    window.popouts.main = window.popouts.main ? Object.assign(window.popouts.main, win) : win;
                    window.popoutChanges.forEach(fn=>fn());
                    window.popoutChanges = [];
                    window.localStorage.setItem('wins', JSON.stringify(window.popouts));                    
                    window.rateLimiter = false;
                },1000);
            } else {
                window.popoutChanges.push(()=>{
                    window.popouts.main = window.popouts.main ? Object.assign(window.popouts.main, win) : win;                
                })
            }
        })

        // subscribe to send options when tray is ready
        fin.desktop.InterApplicationBus.subscribe(currentWindow.uuid,'system-tray','ready',(msg)=>{
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            let trayOptions = {
                'always-on-top': window.popouts.alwaysOnTop,
                'close-on-exit': window.popouts.closeOnExit,
            }
            fin.desktop.InterApplicationBus.send(currentWindow.uuid,'system-tray','options', trayOptions);
        })
        // create tray icon window
        var sysTray = new fin.desktop.Window({
            name: "system-tray",
            url: `${window.targetUrl}tray.html`,
            defaultWidth: 180,
            defaultHeight: 163,
            frame: false,
            autoShow: false,
            shadow: true,
            saveWindowState: false,
            alwaysOnTop: true,
        });
        // Click on tray
        const clickListener = clickInfo => {
            if(clickInfo.button === 2) {
                var sysTray = fin.desktop.Window.wrap(fin.desktop.Application.getCurrent().uuid, 'system-tray');
                var width = 180;
                var height = 163;
                sysTray.isShowing(showing => {
                    if(!showing) {
                        sysTray.showAt(clickInfo.x-width, clickInfo.y-height-5, true, ()=>sysTray.resizeBy(1,1,"bottom-right",sysTray.resizeBy(-1,-1,"bottom-right", sysTray.focus())));
                    } else {
                        sysTray.hide();
                    }
                });    
            }
        }
        // set tray
        fin.desktop.Application.getCurrent().setTrayIcon(`${window.targetUrl}icon/symphony.png`, clickListener);

        // listen for always on top
        fin.desktop.InterApplicationBus.subscribe(currentWindow.uuid,'system-tray','always-on-top',(msg)=>{
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            window.popouts.alwaysOnTop = !window.popouts.alwaysOnTop;
            currentWindow.updateOptions({ alwaysOnTop: window.popouts.alwaysOnTop });
            // set option to all child windows            
            fin.desktop.Application.getCurrent().getChildWindows(children => {
                children.forEach(child => {
                    fin.desktop.Window.wrap(child.uuid, child.name).updateOptions({ alwaysOnTop: window.popouts.alwaysOnTop });;
                });
            });         
            window.localStorage.setItem('wins', JSON.stringify(window.popouts));
        });

        // startup logic for always on top
        window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
        let alwaysOnTop = window.popouts;
        currentWindow.updateOptions({ alwaysOnTop: window.popouts.alwaysOnTop });

        // listen for close on exit
        fin.desktop.InterApplicationBus.subscribe(currentWindow.uuid,'system-tray','close-on-exit',(msg)=>{
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            window.popouts.closeOnExit = !window.popouts.closeOnExit;
            window.localStorage.setItem('wins', JSON.stringify(window.popouts));
        });

        window.once = true;
    }
});

// Add logic to keep track of window positioning
app.addEventListener("window-created", obj => {
    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};    
    let childWin = fin.desktop.Window.wrap(obj.uuid, obj.name)
    //update always on top option for Child Windows
    if (window.popouts.alwaysOnTop) {
        childWin.updateOptions({ alwaysOnTop:true })
    }

    // find window and set bounds
    if(obj.name !== obj.uuid && !obj.name.includes('Notifications') && obj.name !== 'queueCounter') {
        for (var pop of Object.keys(window.popouts)) {
            if(window.popouts[pop].name === obj.name) {
                if(window.popouts[pop].left) {
                    const { left, top, width, height } = window.popouts[pop]; 
                    childWin.setBounds(left, top, width, height);         
                };
            }
        }
        // listen for bounds changed to update position
        childWin.addEventListener("bounds-changed", win => {
            if(!window.rateLimiter) {
                window.rateLimiter = true;
                setTimeout(()=> {
                    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
                    for (var pop of Object.keys(window.popouts)) {
                        if(window.popouts[pop].name === win.name) {
                            window.popouts[pop] = Object.assign(window.popouts[pop], win)
                        }
                    }
                    window.popoutChanges.forEach(fn=>fn());
                    window.popoutChanges = [];
                    window.localStorage.setItem('wins', JSON.stringify(window.popouts));                    
                    window.rateLimiter = false;
                },1000);
            } else {
                window.popoutChanges.push(()=>{
                    for (var pop of Object.keys(window.popouts)) {
                        if(window.popouts[pop].name === win.name) {
                            window.popouts[pop] = Object.assign(window.popouts[pop], win)
                        }
                    }
                })
            }
        })
    }
});

app.addEventListener("window-closed", obj => {
    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
    if(obj.name !== obj.uuid && !obj.name.includes('Notifications') && obj.name !== 'queueCounter') {        
        for (var pop of Object.keys(window.popouts)) {
            if(window.popouts[pop] && window.popouts[pop].name === obj.name) {
                let targetPop = pop;
                setTimeout(()=> {
                    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};                    
                    window.popouts[targetPop].hide = true;
                    window.localStorage.setItem('wins', JSON.stringify(window.popouts));     
                },1000)
            }
        }
    };
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
            if(count<15) {
                count++;
                setTimeout(()=>waitForElement(query, count, cb),450)
            }
        }
    };
    const popoutsCheck = elements => {
        popsToOpen = [];
  
        Array.from(elements).forEach(el => {
            let userId = el.children[0] && el.children[0].attributes['1'] && el.children[0].attributes['1'].value;
            if (!userId) { 
                userId = el.children[0] && el.children[0].innerText;
            };
            el.parentNode.parentNode.parentNode.addEventListener('click', () => {
                for (var pop of Object.keys(window.popouts)) {
                    if(window.popouts[pop].userId === userId && !window.popouts[pop].hide) {
                        let popWin = fin.desktop.Window.wrap(window.popouts[pop].uuid, window.popouts[pop].name);
                        window.winFocus(popWin);
                    }
                }
            })
  
            for (var pop of Object.keys(window.popouts)) {
                if(window.popouts[pop].userId && window.popouts[pop].userId === userId && !window.popouts[pop].hide) {
                    popsToOpen.push(el)
                }
            }
        });

        async function openPopouts() {
            if(window.popouts['inbox'] && !window.popouts['inbox'].hide) {
                await timeout(1100);
            };
            for(var pop of popsToOpen) {
                pop.click();
                await timeout(450);
                document.getElementsByClassName('enhanced-pop-out')[0].click();
                await timeout(650);
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
                    window.winFocus(popWin);
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
                window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};                
                let target = e.target;
                let attr = target && target.attributes;
                let child = target && target.children && target.children[0];

                let userId = attr && attr['1'] && attr['1'].value || 
                             child && child.attributes && child.attributes['1'] && child.attributes['1'].value;
                if (!userId) {
                    try {
                    let clicked =  e.target.parentNode.parentNode.parentNode.parentNode;
                    userId = clicked.attributes && clicked.attributes['1'] && clicked.attributes['1'].value;
                    } catch(e) {console.log(e)}
                };

                // find the window by userId
                let inboxTarget;
                for (var pop of Object.keys(window.popouts)) {
                    if(window.popouts[pop].userId === userId) {
                        inboxTarget = window.popouts[pop]; 
                    }
                }

                // If both inbox and target are in main window do nothing
                if (inboxTarget && !inboxTarget.hide) {
                    // Target conversation is in a popout, restore if minimized and set as foreground
                    let popWin = fin.desktop.Window.wrap(inboxTarget.uuid, inboxTarget.name);
                    window.winFocus(popWin);
                } else if (fin.desktop.Window.getCurrent().name !== win.name) {
                    // Inbox is in popout and target conversation is not - restore main window if minimized and bring to front
                    window.winFocus(win);
                } 
            })
        });
    };

    let curWindow = fin.desktop.Window.getCurrent();
    if (curWindow.uuid!==curWindow.name && window.name === window.parent.name) {
        // remove 'x' that does nothing on click
        waitForElement('.close-module',0,el=>el[0].style.display = 'none');

        waitForElement('.floater',0,element=>{
            waitForElement('.simple_grid_main_container',0,el=> {
                window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};        
                let streamId = el[0] && el[0].attributes['2'].value;
                // Set userId for startup
                if(streamId.includes('chatroom')) {
                    streamId = streamId.slice(8);
                    waitForElement('#chatroom-header-name',0,ele=> {
                        let userId = ele[0].children[0].children[0].children[0].children[0].innerText;
                        window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};                                
                        window.popouts[streamId].userId = userId;
                        window.localStorage.setItem('wins', JSON.stringify(window.popouts));                              
                    })
                } else {
                    streamId = streamId.slice(2);
                    waitForElement('.aliasable.colorable.has-profile.truncate-text',0,elem => {
                        let userId =elem[0] && elem[0].attributes['1'].value;
                        window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};                        
                        window.popouts[streamId].userId = userId;            
                        window.localStorage.setItem('wins', JSON.stringify(window.popouts));
                    })
                }        
            })
        });
    } else {
        //Re-open popouts & inbox when app is restarted 
        waitForElement('button.toolbar-btn-inbox',0,el=> inboxCheck(el));    
        waitForElement('.navigation-item-name',0,el=> popoutsCheck(el));
    }

    // Navigation from Inbox
    waitForElement('#dock',0,el=> inboxNavigation(el));

});