
let thiswindow = fin.desktop.Window.getCurrent();
window.oneSub = false;
if (thiswindow.uuid===thiswindow.name && window.name === window.parent.name && !window.oneSub) {
    console.log('subscribing to connection stuff!!!!!!!!!!!!!!!')
    fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect", (msg, uuid, name) => {
        console.log("The application " + uuid + " sent this message: " + msg);
        fin.desktop.InterApplicationBus.send(uuid, name, "symphony-connect-out", 'Symphony Connect!')
    }, () => fin.desktop.InterApplicationBus.publish("*", "symphony-connect-out", 'Symphony Started!', ()=>console.log('published connect-out')))
        
    fin.desktop.InterApplicationBus.subscribe("*", "initiate-symphony-notes", (msg, uuid, name) => {
        console.log('in init sym notes')
        window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
        if(window.connections.notifications && window.connections.notifications.length) {
            window.connections.notifications.push(uuid);
        } else {
            window.connections.notifications = [uuid];
        }
        window.localStorage.setItem('connects', JSON.stringify(window.connections));    
    })

    fin.desktop.InterApplicationBus.subscribe("*", "surpress-symphony-notes", (msg, uuid, name) => {
        console.log('in surpress sym notes')
        window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
        window.connections.surpressNotifications = true;
        window.localStorage.setItem('connects', JSON.stringify(window.connections));    
        console.log("The application " + uuid + "surpressed notifications!");
    })
    window.oneSub = true;
}