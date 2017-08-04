/* override window.open to fix name issue */
var originalOpen = window.open;
window.open = (...args) => {
   let w = originalOpen.apply(this, args);
    //Try catch for cross domain safeguard
    try {
       w.name = args[1];
     } catch (e) {
     }

     return w;
}

/*
  to do:
    - events for notifications
    - fix pop-out (talk to Lynn)

*/
/*
* Class representing a Symphony notification
*/
class Notify {

  constructor(title,options){
      console.log("SSF Notify " + JSON.stringify(title) + JSON.stringify(options));
      let msg = options;
      msg.title =  title;
      let notification = new window.fin.desktop.Notification({
      url:"http://localhost:8080/notification.html",
      message:msg
    });

    this._data = options.data || null;
  }

  static get permission(){
    return "granted";
  }

  get data(){
    return this.data;
  }

  close(){

  }

  addEventListener(event, cb) {

  }

  removeEventListener(event, cb){

  }

  removeAllEvents(){

  }

  destroy(){

  }
}

/*
  core symphony API
*/
window.SYM_API = {
  Notification:Notify,

  setBadgeCount:function(Number){
    console.log("SSF Badgecount " + Number);
  },
  ScreenSnippet:function(){
    console.log("SSF Screen Snippet requested");
  },
  activate:function(){
    console.log("SSF Activate!");
    fin.desktop.Window.getCurrent().bringToFront();
  },
  //undoced
  registerLogger:function(){
    console.log("SSF registerLogger!!");
  },
  registerBoundsChange:function(callback){
    console.log("SSF boundschange!")
    var cb = callback;
    fin.desktop.Window.getCurrent().addEventListener("bounds-changed",obj => {
      cb({x:obj.left,
          y:obj.top,
          width:obj.width,
        height:obj.height,
      windowName:obj.name});
    })
  }

}



window.ssf = window.SYM_API;
window.ssf.activate();
