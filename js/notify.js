/*
* Class representing a Symphony notification
*/

class Notify {

    constructor(title,options){
        console.log("SSF Notify " + JSON.stringify(title) + JSON.stringify(options));
        let msg = options;
        msg.title =  title;
        let app = fin.desktop.Application.getCurrent();
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            url: "http://localhost:8080/notification.html",
            message: msg,
            onClick: () => {
                app.window.setAsForeground();
            }
        });
        this._data = options.data || null;
    }

    static get permission(){
        return "granted";
    }

    get data(){
        return this.data;
    }

    close(cb) {
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        console.log('SSF Notify Event Listener', event, cb);
        // Utilize the OF notification object to accomplish - can re-write to accomplish multiple cb / listeners per event 
        this.eventListeners.push(event)

        if(event === 'click') {
            this.notification.noteWin.onClick = cb
        } else if(event === 'close') {
            this.notification.noteWin.onClose = cb
        } else if(event === 'error') {
            this.notification.noteWin.onError = cb
            console.log(this.notification.noteWin.onError)
        }

        // this.eventListeners[event] = cb; // NEED THIS FOR REMOVE ALL... ASSUMES ONLY ONE CB PER EVENT... 
        // // ADD ON SYSTEM? WINDOW? GETS CALLED WITH CLICK CLOSE AND ERROR AUTOMATICALLY... THIS FUNCTIONALITY SHOULD BE ON NOTIFICATION OBJECT
        // fin.desktop.System.addEventListener(event, cb, () => {
        //     console.log("The registration was successful");
        // }, function (err) {
        //     console.log("failure: " + err);
        // });
    }

    removeEventListener(event, cb){
        console.log('SSF Notify Event Listener Removed', event, cb);

        if(event === 'click') {
            this.notification.noteWin.onClick = () => {};
        } else if(event === 'close') {
            this.notification.noteWin.onClose = () => {};
        } else if(event === 'error') {
            this.notification.noteWin.onError = () => {};
        }


        // fin.desktop.System.removeEventListener(event, cb, () => {
        //     console.log("The removal was successful");
        //     delete this.eventListeners[event];
        // }, function (err) {
        //     console.log("failure: " + err);
        // });
    }

    removeAllEvents(){
        while(this.eventListeners.length) {
            removeEventListener(this.eventListeners.pop());
        }
    }

    destroy(){
        // How is this different from close?
    }
}