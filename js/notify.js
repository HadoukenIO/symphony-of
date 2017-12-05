/*
* Class representing a Symphony notification
*/

class Notify {

    constructor(title,options){
        let msg = options || {};
        console.log('Notification Options:', options);        
        msg.title =  title;
        let timeout = 5000;
        let app = fin.desktop.Application.getCurrent();       
        let clickHandle = () => {
            let targetWin = window.popouts[msg.data.streamId];
            let ofTargetWin = fin.desktop.Window.wrap(targetWin.uuid, targetWin.name);
            if(targetWin && !targetWin.hide) {
                window.winFocus(ofTargetWin)
            } else {
                fin.desktop.InterApplicationBus.publish("note-clicked", msg.data.streamId);
            }
        }
        let onClick = clickHandle;
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            onClick = () => { 
                clickHandle();
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
        //     console.log('click event', cb)
        //     this.notification.noteWin.onClick = () => {
                
        //     } 
        // }
        // if(event === 'click') {
        //     this.notification.noteWin.onClick = cb.bind(this,this._data);
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

