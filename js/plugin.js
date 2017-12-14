
class symphonyPlugin {
    constructor(identity, symphonyUuid) {
        this.identity = identity;
        this.symphonyUuid = symphonyUuid;
    }

    static connect() {
        if(this.symphonyUuid) {
            return this;
        }
        return new Promise(resolve => {
            let identity = fin.desktop.Window.getCurrent();            
            let listener = (msg, uuid, name)=> {
                // NEED ANYTHING HERE EXCEPT UUID?
                console.log('connect out sub listener fired');
                fin.desktop.InterApplicationBus.unsubscribe("*", "symphony-connect-out", listener);
                resolve(new symphonyPlugin(identity, uuid));
            }

            fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect-out", listener,
                () => fin.desktop.InterApplicationBus.publish("symphony-connect", {uuid:identity.uuid, name:identity.name}),
                e=> console.log('connect error:', e)
            );
        })
    }

    onNotification(cb) {
        // rework as promise???????????
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-notes", (msg, uuid, name)=>{
            console.log('sym notes listener')
            cb(msg);
        }, () => fin.desktop.InterApplicationBus.send(this.symphonyUuid, "initiate-symphony-notes"));
    }

    surpressNotificationWindows() {
        fin.desktop.InterApplicationBus.send(this.symphonyUuid, "surpress-symphony-notes", console.log('Notes Surpressed!'));
    }

    getUserContextUpdates() {
        // turn this on? 
        // fin.desktop.InterApplicationBus.send(this.symphonyUuid, "symphony-get-user", console.log('Symphony will send user context!'));
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-user-focus", e => console.log('got user', e));

    }

    changeSymphonyContext(obj) {
        fin.desktop.InterApplicationBus.send('*', "symphony", obj);        
    }

}


symphonyPlugin.connect()
.then(SymOFApi => {
console.log(SymOFApi)
   SymOFApi.onNotification(e=>console.log(e));
//    SymOFApi.surpressNotificationWindows();
})
