/*
* Class representing a Symphony notification
*/

module.exports = class Notify {

    constructor(title,options){
        console.log("SSF Notify " + JSON.stringify(title) + JSON.stringify(options));
        let msg = options;
        console.log('options', options)
        msg.title =  title;
        let app = fin.desktop.Application.getCurrent();
        this.eventListeners = {};
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

    close(cb){
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        console.log('add event listener', event, cb);
        this.eventListeners[event] = cb; // NEED THIS FOR REMOVE ALL... ASSUMES ONLY ONE CB PER EVENT... 
        // ADD ON SYSTEM? WINDOW? GETS CALLED WITH CLICK CLOSE AND ERROR AUTOMATICALLY... THIS FUNCTIONALITY SHOULD BE ON NOTIFICATION OBJECT
        fin.desktop.System.addEventListener(event, cb, () => {
            console.log("The registration was successful");
        }, function (err) {
            console.log("failure: " + err);
        });
    }

    removeEventListener(event, cb){
        fin.desktop.System.removeEventListener(event, cb, () => {
            console.log("The removal was successful");
            delete this.eventListeners[event];
        }, function (err) {
            console.log("failure: " + err);
        });
    }

    removeAllEvents(){
        // NEEDS TO BE TESTED
        Object.keys(this.eventListeners).forEach(key => removeEventListener(key, this.eventListeners.key))
    }

    destroy(){
        // How is this different from close?
    }
}