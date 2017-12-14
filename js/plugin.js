
class symphonyPlugin {
    constructor(identity, symphonyUuid) {
        this.indentity = identity;
        this.symphonyUuid = symphonyUuid;
    }

    static connect() {
        if(this.symphonyUuid) {
            return this;
        }
        return new Promise(resolve => {
            let listener = (msg, uuid, name)=> {
                // NEED ANYTHING HERE EXCEPT UUID?
                let identity = fin.desktop.Window.getCurrent();
                fin.desktop.InterApplicationBus.unsubscribe("*", "symphony-connect-out", listener);
                resolve(new symphonyPlugin(identity, uuid));
            }

            fin.desktop.InterApplicationBus.subscribe("*", "symphony-connect-out", listener,
                fin.desktop.InterApplicationBus.publish("symphony-connect", {uuid:identity.uuid, name:identity.name}),
                e=> console.log('connect error:', e)
            );
        })
    }

    onNotification(cb) {
        // rework as promise???????????
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-notes", (msg, uuid, name)=>{
            cb(msg);
        }, fin.desktop.InterApplicationBus.send(this.symphonyUuid, "initiate-symphony-notes"));
    }

    surpressNotificationWindows() {
        fin.desktop.InterApplicationBus.send(this.symphonyUuid, "surpress-symphony-notes");
    }



}

fin.Plugins.SymphonyOF = symphonyPlugin;

fin.Plugins.SymphonyOF.connect()
.then(SymOFApi => {
   SymOFApi.OnNotification(notification => {
       // response object will have title, body, icon, and onClick properties
   });
   SymOFApi.surpressNotificationWindows();
})
