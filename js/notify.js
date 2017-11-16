/*
* Class representing a Symphony notification
*/

class Notify {

    constructor(title,options){
        let msg = options || {};
        msg.title =  title;
        let timeout = 5000;
        let app = fin.desktop.Application.getCurrent();        
        let onClick = () => app.getWindow().restore(() => {app.getWindow().setAsForeground();});
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            onClick = () => { 
                app.getWindow().restore(() => {app.getWindow().setAsForeground();});
                this.notification.close();
            }
        }
        this.eventListeners = [];
        this.notification = new window.fin.desktop.Notification({
            url: `${window.targetUrl}notification.html`,
            message: msg,
            onClick,
            timeout,
            opacity: 0.92
        });
        this._data = msg.data || null;
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
        //     this.notification.noteWin.onClick = cb
        // } else if(event === 'close') {
        //     this.notification.noteWin.onClose = cb
        // } else if(event === 'error') {
        //     this.notification.noteWin.onError = cb
        }
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

