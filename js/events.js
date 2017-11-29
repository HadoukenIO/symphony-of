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
                // If both inbox and target are in main window do nothing
                if (window.popouts[userId] && !window.popouts[userId].hide) {
                    // Target conversation is in a popout, restore if minimized and set as foreground
                    let popWin = fin.desktop.Window.wrap(win.uuid, window.popouts[userId].name);
                    popWin.getState(state => {
                        if (state === 'minimized') {
                            popWin.restore(() => {popWin.setAsForeground();},e=>console.log(e));                            
                        } else {
                            popWin.setAsForeground();    
                        }
                    })
                } else if (fin.desktop.Window.getCurrent().name !== win.name) {
                    // Inbox is in popout and target conversation is not - restore main window if minimized and bring to front
                    win.getState(state => {
                        if (state === 'minimized') {
                            win.restore(() => {win.setAsForeground();},e=>console.log(e));                            
                        } else {
                            win.setAsForeground();    
                        }
                    })
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