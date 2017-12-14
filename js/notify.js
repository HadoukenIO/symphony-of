/*
* Class representing a Symphony notification
*/

class Notify {

    constructor(title,options){
        let msg = options || {};
        msg.title =  title;        
        console.log('Notification Options:', options);

        // connections that have requested notifications
        window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications: []};
        window.connections.notifications.forEach(uuid => {
            fin.desktop.InterApplicationBus.send(uuid, msg);
        });

        if(window.connections.surpressNotifications) {
            console.log('Notification surpressed!');
            return
        }

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
        let onClick = () => { clickHandle(options.data)};
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            onClick = () => { 
                () => { clickHandle(options.data)}
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
        this.callbackJSON = options.data;
    }

    static get permission(){
        return "granted";
    }

    get data(){
        return this._data;
    }

    close(cb) {
        // This gets called immediately on a new notification...so commented out for now.
        // this.notification.close(cb)
    }

    addEventListener(event, cb) {
        // Utilize the OF notification object to accomplish
        // this.eventListeners.push(event)
        if(event === 'click') {
            this.notification.noteWin.onClick = () => cb({target:{callbackJSON:this._data}});
        }
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
