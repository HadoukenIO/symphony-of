
class symphonyPlugin {
    constructor(identity, symphonyUuid) {
        this.identity = identity;
        this.symphonyUuid = symphonyUuid;
        fin.desktop.InterApplicationBus.subscribe("*", "symphony-exit-out", () => {
            // reconnect on symphony exit
            this.symphonyUuid = null;
            symphonyPlugin.connect()
            .then(SymOFApi => {
                this.symphonyUuid = SymOFApi.symphonyUuid;
                let redoFunctions = this.notificationFunctions;
                this.notificationFunctions = [];
                redoFunctions.forEach(fn => fn.call(this));
                if(this.surpress) {
                    fin.desktop.InterApplicationBus.send(this.symphonyUuid, "surpress-symphony-notes", 'surpress-notes', () => console.log('Notes Surpressed!'));
                }
            });
        });
        this.surpress = this.surpress ? this.surpress : false;
        this.notificationFunctions = this.notificationFunctions ? this.notificationFunctions : [];
    }

    static connect() {
        if(this.symphonyUuid) {
            return this;
        }

        return new Promise(resolve => {
            let identity = fin.desktop.Window.getCurrent();            
            let listener = (msg, uuid, name) => {
                console.log('connect out sub listener fired');
                fin.desktop.InterApplicationBus.unsubscribe("*", "symphony-connect-out", listener);
                resolve(new symphonyPlugin(identity, uuid));
            }
            fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect-out", listener);

            // this should be in the success callback of the subscribe above, but I believe due to a core bug, that success cb isnt being called
            fin.desktop.InterApplicationBus.publish("symphony-connect", {uuid:identity.uuid, name:identity.name})
        })
    }

    onNotification(cb) {
        let listener = (msg, uuid, name)=>{
            console.log('sym notes listener')
            cb(msg);
        };
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-notes", listener, () => {
            fin.desktop.InterApplicationBus.send(this.symphonyUuid, "initiate-symphony-notes");
            this.notificationFunctions.push(() => fin.desktop.InterApplicationBus.send(this.symphonyUuid, "initiate-symphony-notes"));
        }, e => console.log('connect error:', e));
        let unsubscribe = () => fin.desktop.InterApplicationBus.unsubscribe(this.symphonyUuid, "symphony-notes", listener);
        return unsubscribe;
    }

    undoSurpressNotifications() {
        fin.desktop.InterApplicationBus.send(this.symphonyUuid, "unsurpress-symphony-notes", 'unsurpress-notes', () => {
            console.log('Notes unSurpressed!')
            this.surpress = false;
        });
    }

    surpressNotificationWindows(symphonyUuid) {
        fin.desktop.InterApplicationBus.send(this.symphonyUuid, "surpress-symphony-notes", 'surpress-notes', () => {
            console.log('Notes Surpressed!')
            this.surpress = true;
        });
        return this.undoSurpressNotifications.bind(this);
    }

    getUserContextUpdates(cb) {
        let listener = (msg, uuid, name) => {
            cb(msg);
        };
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-user-focus", listener, () => {
            console.log('getting user context updates');
        }, e => console.log('connect error:', e));
        let unsubscribe = () => fin.desktop.InterApplicationBus.unsubscribe(this.symphonyUuid, "symphony-user-focus", listener);
        return unsubscribe;
    }

    // takes an obj that either has 'emails' property of an array or 'name' as a string
    // this is due to the need to resolve the name, can only search 1 at a time; emails can do multiples
    changeContext(obj) {
        fin.desktop.InterApplicationBus.send('*', "symphony-context", obj);        
    }

    //  NOT WORKING!!!!!!!!  takes an obj that either has 'emails' property of an array and a message property as a string
    // do we want to risk msg send with name...?
    changeContextAndSendMessage(obj) {
        fin.desktop.InterApplicationBus.send('*', "symphony-message", obj);        
    }

}

fin.symphonyPlugin = symphonyPlugin;


fin.symphonyPlugin.connect()
.then(SymOFApi => {
   console.log(SymOFApi)
   window.api = SymOFApi;
   window.notificationUnSub = SymOFApi.onNotification(e=>console.log(e));
   window.surpressNotificationUnSub = SymOFApi.surpressNotificationWindows();
   window.userContextUnSub = SymOFApi.getUserContextUpdates(e => console.log('got user', e));
   setTimeout(()=>SymOFApi.changeContext({name:'xavier'}),8000);
   setTimeout(()=>SymOFApi.changeContext({emails:['xavier@openfin.co', 'mark@openfin.co']}),12000);
})

