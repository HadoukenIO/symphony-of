let app = fin.desktop.Application.getCurrent();
let win = app.getWindow();
window.rateLimiter = false;
window.once = false;
window.popoutChanges = [];
window.mustClose = false;

window.addEventListener('load', () => {
    const currentWindow = fin.desktop.Window.getCurrent();
    const application = fin.desktop.Application.getCurrent();
    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};

    // *********** BOUNDS LOGIC ***************
    const convertAndSaveBounds = bounds => {
        const { top, left, width, height, name } = bounds
        const symBounds = {
            x: left,
            y: top,
            width, 
            height, 
            windowName: name
        }
        window.saveBounds(symBounds);
    }
    if(currentWindow.uuid===currentWindow.name) {
        currentWindow.addEventListener('bounds-changed', convertAndSaveBounds);
        application.addEventListener('window-created', w => {
            if (w && !w.name.includes('Notifications') && !w.name.startsWith('Notify') && w.name !== 'queueCounter' && w.name !== 'system-tray' && args[1] !== 'main' && w.name !== 'Notification Positioning Window') {
                const ofWin = fin.desktop.Window.wrap(w.uuid, w.name);
                ofWin.addEventListener('bounds-changed', convertAndSaveBounds);
                ofWin.getBounds(convertAndSaveBounds);
            }
        })
    } else {
        currentWindow.addEventListener('close-requested', e => {
            const closeArr = document.querySelectorAll('.close-module')
            closeArr[0].click();
            fin.desktop.Window.getCurrent().close(true);
        })
    }


    // *********** NOTIFICATION LOGIC ***************
    if (window.localStorage.getItem('notificationsLocation') === null) {
        window.localStorage.setItem('notificationsLocation', "top-right");
    }
    if (window.localStorage.getItem('notificationsMonitor') === null) {
        window.localStorage.setItem('notificationsMonitor', 1);
    }

    
    // *********** SYSTEM TRAY LOGIC ***************
    if(currentWindow.uuid===currentWindow.name && !parent.once) {
        //navigate to converation from main window on notification click
        window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};

        fin.desktop.InterApplicationBus.subscribe(application.uuid, 'system-tray', 'must-close', (msg, senderUuid) => {
            window.mustClose = true;
        });

        fin.desktop.InterApplicationBus.subscribe('*', 'teardown', (msg, senderUuid) => {
            if (application.uuid === senderUuid) return;
            application.close();
        });

        //Overwrite closing of application to minimize instead
        currentWindow.addEventListener('close-requested',() => {
            fin.desktop.InterApplicationBus.publish('teardown', true)
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            if(window.popouts.closeOnExit || window.mustClose) {
                fin.desktop.Application.getCurrent().close(true);
            } else {
                fin.desktop.Application.getCurrent().getWindow().minimize();        
            }
        });

        //add handling for navigation outside of symphony
        application.addEventListener("window-navigation-rejected", obj => {
            if (name==='main') {
                fin.desktop.System.openUrlWithBrowser(obj.url);
            }
        });

        // In case runtime hangs on exit
        application.addEventListener("not-responding", () => {
            fin.desktop.System.exit(() => console.log("successful exit"), err => console.log("exit failure: " + err));
        });

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
            defaultWidth: 200,
            defaultHeight: 6*33, // 6 base entries 33px tall
            frame: false,
            autoShow: false,
            shadow: true,
            saveWindowState: false,
            alwaysOnTop: true,
            icon: 'https://raw.githubusercontent.com/symphonyoss/SymphonyElectron/master/build/icon.ico',
        }, () => {
            console.log('this has created a sys tray window');
        });

        // listen for always on top
        fin.desktop.InterApplicationBus.subscribe(currentWindow.uuid,'system-tray','always-on-top',(msg)=>{
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            window.popouts.alwaysOnTop = msg;
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
        currentWindow.updateOptions({ alwaysOnTop: window.popouts.alwaysOnTop });

        // listen for close on exit
        fin.desktop.InterApplicationBus.subscribe(currentWindow.uuid,'system-tray','close-on-exit',(msg)=>{
            window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
            window.popouts.closeOnExit = msg;
            window.localStorage.setItem('wins', JSON.stringify(window.popouts));
        });

        window.once = true;
    }
});

window.addEventListener('click', t => {
    const a = t.target.closest('a');
    if (a && a.target === '_blank') {
        t.preventDefault();
        t.stopPropagation();
        fin.desktop.System.openUrlWithBrowser(a.href,
            _ => console.log('opened ', a.href, 'from ', location.href),
            e => console.log(e, location.href));
    }
}, true);