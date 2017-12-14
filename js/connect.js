

fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect", (msg, uuid, name) => {
    console.log("The application " + uuid + " sent this message: " + message);
    fin.desktop.InterApplicationBus.send(uuid, name, "symphony-connect-out", 'Symphony Connect!')
}, fin.desktop.InterApplicationBus.publish("*", "symphony-connect-out", 'Symphony Started!'))
    
fin.desktop.InterApplicationBus.subscribe("*", "initiate-symphony-notes", (msg, uuid, name) => {
    window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
    window.connections.push(uuid);
    window.localStorage.setItem('connects', JSON.stringify(window.connections));    
})

fin.desktop.InterApplicationBus.subscribe("*", "surpress-symphony-notes", (msg, uuid, name) => {
    window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
    window.connections.surpressNotifications = true;
    window.localStorage.setItem('connects', JSON.stringify(window.connections));    
    console.log("The application " + uuid + "surpressed notifications!");
})