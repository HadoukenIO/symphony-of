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
        console.log('in win create - name', obj.name)
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
    setTimeout(()=> {
        for (let pop of Object.keys(window.popouts)) {
            if(window.popouts[pop] && window.popouts[pop].name === obj.name) {
                window.popouts[pop].hide = true;
                localStorage.setItem('wins', JSON.stringify(window.popouts));            
            }
        }
    },1000)
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