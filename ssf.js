console.log("SSF is here!!");

window.SYM_API = {
  Notification:function(title, options){
    console.log("SSF Notification!!")
    return new fin.desktop.Notification({
      url:"http://localhost:8080/notification.html",
      message:title
    });
  },
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
    console.log("registerLogger!!");
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
