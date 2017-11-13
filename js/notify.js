/*
* Class representing a Symphony notification
*/

let holdNote = window.Notification;

class Notify {

    constructor(title,options){
        let msg = options;
        msg.title =  title;
        let timeout = 5000;
        let onClick = () => app.getWindow().restore(() => {app.getWindow().setAsForeground();});
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            onClick = () => this.notification.close();
        }
        let app = fin.desktop.Application.getCurrent();
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            url: `http://localhost:8080/notification.html`,
            // url: `${window.targetUrl}notification.html`,
            message: msg,
            onClick,
            timeout,
            opacity: 1
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
        // This gets called immediately on a new notification...so commented out for now.
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        // Utilize the OF notification object to accomplish
        // this.eventListeners.push(event)

        // if(event === 'click') {
        //     // this.notification.noteWin.onClick = cb
        // } else if(event === 'close') {
        //     this.notification.noteWin.onClose = cb
        // } else if(event === 'error') {
        //     this.notification.noteWin.onError = cb
        // }
    }

    removeEventListener(event, cb){
        // if(event === 'click') {
        //     // this.notification.noteWin.onClick = () => {};
        // } else if(event === 'close') {
        //     // this.notification.noteWin.onClose = () => {};
        // } else if(event === 'error') {
        //     // this.notification.noteWin.onError = () => {};
        // }
    }

    removeAllEvents(){
        // while(this.eventListeners.length) {
        //     removeEventListener(this.eventListeners.pop());
        // }
    }

    destroy(){
        // How is this different from close?
    }
}

