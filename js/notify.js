/*
* Class representing a Symphony notification
*/

let holdNote = window.Notification;

class Notify {

    constructor(title,options){
        // console.log('NOTIFY OPTIONS:', options)
        let msg = options;
        msg.title =  title;
        // let app = fin.desktop.Application.getCurrent();
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            // url: `http://localhost:5555/creation.html`,
            // url: `${targetUrl}notification.html`,
            url: `${targetUrl}blankNote.html`,
            message: msg,
            onClick: () => {
                app.getWindow().restore(() => {app.getWindow().setAsForeground();});
            },
            onShow: () => {
                console.log('SUCCESS', msg.body)
            },
            onError: (e) => {
                console.log('Error', e, msg.body)
            },
            timeout: 5000,
            opacity: 0.5
        });
        this._data = options.data || null;
    }

    static get permission(){
        console.log('permission called')
        return "granted";
    }

    get data(){
        console.log('called get data')
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

