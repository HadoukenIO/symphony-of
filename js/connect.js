
let thiswindow = fin.desktop.Window.getCurrent();
window.oneSub = false;
if (thiswindow.uuid===thiswindow.name && window.name === window.parent.name && !window.oneSub) {
    //Over-write once to clear out connections
    window.connections = {notifications:[]};
    window.localStorage.setItem('connects', JSON.stringify(window.connections));    

    //HELPERS------------------------------------------------------------------------------>

    // takes an array of emails and starts chat with those users
    window.startChatByEmail = (emails) => {
        Promise.all(emails.map(email=> {
            return window.findUserByEmail(email);
        }))
        .then(userArray => {
            console.log(userArray)
            let userIds = userArray.map(obj => obj.id);
            window.startChat(userIds);
        })
    }

    // takes name as a string and starts a chat - NEEDS WORK
    window.startChatByName = name => {
        window.findUserByQuery(name)
        .then(result=> {
            if (result.users.length === 1) {
                window.startChat([result.users[0].id]);
            } else if (result.users.length > 1) {
                let queryIds = result.users.map(user => user.id);
                // create flag so can pop up modal if no one is found!!!!!!!!!!!
                // get all connections ONLY gets connections that are NOT automatic (Connections inside POD can be automatic)
                window.getAllConnections()
                .then(userArray=> {
                    // RIGHT NOW RETURNS FIRST FOUND NAME THAT MATCHES....
                    userArray.find(user => {
                        if(queryIds.includes(user.userId)){
                            window.startChat([user.userId]);
                            return true;                              
                        }
                    });
                    // If not in your connections (may be auto-connected in your POD) - if you have a stream open with person this finds it
                    window.getAllStreams()
                    .then(streams => {
                        let streamUserIds = streams.reduce((acc, stream)=> {
                            let members = stream.streamAttributes &&  stream.streamAttributes.members
                            return members ? [...acc, ...members] : acc;
                        },[])
                        // RIGHT NOW RETURNS FIRST FOUND NAME THAT MATCHES....
                        streamUserIds.find(userId => {
                            if(queryIds.includes(userId)){
                                window.startChat([userId]);
                                return true;    
                            }
                        });
                    }) 
                })
            }
        })                       
    }
    // END HELPERS ------------------------------------------------------------------------------------->

    console.log('subscribing to external connection logic');

    // Initiate connection
    fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect", (msg, uuid, name) => {
        console.log("The application " + uuid + " sent this message: " + msg);
        fin.desktop.InterApplicationBus.send(uuid, name, "symphony-connect-out", 'Symphony Connect!')
    }, () => fin.desktop.InterApplicationBus.publish("symphony-connect-out", 'Symphony Started!', ()=>console.log('published connect-out')))
    
    // Allow external app to get symphony notifications
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

    // Allow external app to surpress symphony notifications
    fin.desktop.InterApplicationBus.subscribe("*", "surpress-symphony-notes", (msg, uuid, name) => {
        console.log('surpress sym notes')
        window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
        window.connections.surpressNotifications = true;
        window.localStorage.setItem('connects', JSON.stringify(window.connections));    
        console.log("The application " + uuid + " surpressed notifications!");
    })

    // Allow external app to undo surpress symphony notifications
    fin.desktop.InterApplicationBus.subscribe("*", "unsurpress-symphony-notes", (msg, uuid, name) => {
        console.log('unsurpress sym notes')
        window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
        window.connections.surpressNotifications = false;
        window.localStorage.setItem('connects', JSON.stringify(window.connections));    
        console.log("The application " + uuid + " unsurpressed notifications!");
    })

    // Allow external app to update symphony context
    fin.desktop.InterApplicationBus.subscribe("*", "symphony-context", (message, uuid, name) => {
        console.log("The application " + uuid + '/' + name + " sent this message: " + message);
        //takes an array of user emails - if emails array exists, search it
        if(message && message.emails && Array.isArray(message.emails)) {
            window.startChatByEmail(message.emails);
            // cannot search multiple people by name... could get too many results to resolve... 
        } else if(message && message.name) {
            window.startChatByName(message.name);
        }
    });

    window.oneSub = true;
}