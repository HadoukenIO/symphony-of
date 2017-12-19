
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

    getUserContextUpdates(cb) {
        // turn this on? 
        // fin.desktop.InterApplicationBus.send(this.symphonyUuid, "symphony-get-user", console.log('Symphony will send user context!'));
        fin.desktop.InterApplicationBus.subscribe(this.symphonyUuid, "symphony-user-focus", cb);
    }

    // takes an obj that either has 'emails' property of an array or 'name' as a string
    // this is due to the need to resolve the name, can only search 1 at a time; emails can do mulitples
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

// fin.symphonyPlugin.connect()
// .then(SymOFApi => {
//    console.log(SymOFApi)
//    SymOFApi.onNotification(e=>console.log(e));
//    SymOFApi.surpressNotificationWindows();
//    SymOFApi.getUserContextUpdates(e => console.log('got user', e));
//    setTimeout(()=>SymOFApi.changeContext({name:'xavier'}),8000);
//    setTimeout(()=>SymOFApi.changeContext({emails:['xavier@openfin.co', 'mark@openfin.co']}),8000);
// })

