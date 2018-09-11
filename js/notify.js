/*
* Class representing a Symphony notification
*/



class Notify {

    constructor(title,options){
        var notificationsVersion = window.localStorage.getItem('notificationsVersion');
        var notificationsLocation = window.localStorage.getItem('notificationsLocation');
        var notificationsHeight = parseInt(window.localStorage.getItem('notificationsHeight'));
        var notificationsMonitor = parseInt(window.localStorage.getItem('notificationsMonitor'));
        var monitorInfo = JSON.parse(window.localStorage.getItem('monitorInfo'));
        
        
        let msg = options || {};
        console.log('Notification Options:', options);        
        msg.title =  title;
        let timeout = 5000;
        if (msg.sticky) {
            timeout = 60000*60*24; // 24 hours
            this.sticky = msg.sticky;
        }
        if (notificationsVersion === "V1") {
          this.notification = new window.fin.desktop.Notification({
              url: `${window.targetUrl}notificationV1.html`,
              message: msg,
              timeout,
              opacity: 0.92
          });
        } else if (notificationsVersion === "V2") {
          var randomString = Math.random().toString(36).slice(-8);
          
          console.log("RIGHT BEFORE CREATING NEW NOTIFICATION")
          
          var notification = new window.fin.desktop.Window({
            customData: msg,
            name: 'Notify-' + msg.tag + randomString,
            defaultWidth: 300,
            defaultHeight: notificationsHeight,
            minWidth: 300,
            minHeight: notificationsHeight,
            maxWidth: 300,
            maxHeight: notificationsHeight,
            frame: false,
            resizable: false,
            url: `${window.targetUrl}notificationV2.html`,
            showTaskbarIcon: false,
            opacity: 0.92,
            alwaysOnTop: true,
            icon: `${window.targetUrl}favicon.ico`
          }, function (success) {
            var conflict = false;
            var conflictIdx = -1;
            
            console.log("notificationWindows before pruning", Notify.openWindows)
            for (var i = 0; i < Notify.openWindows.length; i++) {
              var childWindow = Notify.openWindows[i];
              if (childWindow.name.startsWith('Notify-' + msg.tag)) {
                childWindow.close();
                conflictIdx = i;
                conflict = true;
              }
            }
            
            console.log("Notify.openWindows AFTER PRUNING", Notify.openWindows)
            
            if (conflict && (notificationsLocation === "top-right" || notificationsLocation === "top-left")) {
              var windowsToShift = Notify.openWindows.slice(conflictIdx + 1);
              console.log("windowsToShift", windowsToShift);
              
              for (var i = 0; i < windowsToShift.length; i++) {
                windowsToShift[i].animate({
                  position: {
                    left: 0,
                    top: ((notificationsHeight + 10) * -1),
                    duration: 100,
                    relative: true
                  }
                }, {
                  interrupt: false
                });
              } 
              
              Notify.openWindows.splice(conflictIdx, 1);
            } else if (conflict && (notificationsLocation === "bottom-right" || notificationsLocation === "bottom-left")) {
              var windowsToShift = Notify.openWindows.slice(0, conflictIdx);
              console.log("windowsToShift IN BOTTOM", windowsToShift)
              
              for (var i = 0; i < windowsToShift.length; i++) {
                windowsToShift[i].animate({
                  position: {
                    left: 0,
                    top: (notificationsHeight + 10),
                    duration: 100,
                    relative: true
                  }
                }, {
                  interrupt: false
                });
              }
              
              Notify.openWindows.splice(conflictIdx, 1);
            }
            
            var notificationPosition = Notify.openWindows.length;
            
            console.log("BEFORE LOCATION PLACEMENT")
            
            var monitor;
            if (notificationsMonitor === 1) {
              monitor = monitorInfo.primaryMonitor;
            } else if (monitorInfo.nonPrimaryMonitors[notificationsMonitor - 2]) {
              monitor = monitorInfo.nonPrimaryMonitors[notificationsMonitor - 2];
            } else {
              monitor = monitorInfo.primaryMonitor;
            }
            
            var rightBound = monitor.availableRect.right;
            var rightBoundPlacement = rightBound - 310;
            var bottomBound = monitor.availableRect.bottom;
            var bottomBoundPlacement = bottomBound - notificationsHeight - 10;
            var leftBound = monitor.availableRect.left + 10;
            
            if (notificationsLocation === "top-right") {
              notification.moveTo(rightBoundPlacement, ((notificationsHeight + 10) * notificationPosition) + 10);
            } else if (notificationsLocation === "top-left") {
              notification.moveTo(leftBound, ((notificationsHeight + 10) * notificationPosition) + 10);
            } else if (notificationsLocation === "bottom-left") {
              Notify.shiftBottomWindowsBeforeCreation(Notify.openWindows, notificationsHeight);
              notification.moveTo(leftBound, bottomBoundPlacement);
            } else {
              Notify.shiftBottomWindowsBeforeCreation(Notify.openWindows, notificationsHeight);
              notification.moveTo(rightBoundPlacement, bottomBoundPlacement);
            }
            
            notification.show();
            Notify.openWindows.push(notification);
            console.log(success, "SUCCESS");
          }, function (err) {
            console.log(err, "ERROR");
          });
          
          this.notification = notification;
          
          fin.desktop.InterApplicationBus.subscribe("*", `${notification.name} close`, (message, uuid, name) => {
            console.log(`IN ${notification.name} close click IAB`)
            this.close();
          });
        }
        
        this._data = msg.data || null;
    }

    static shiftBottomWindowsBeforeCreation(windowsArr, notificationHeight) {
      for (var i = 0; i < windowsArr.length; i++) {
        windowsArr[i].animate({
          position: {
            left: 0,
            top: ((notificationHeight + 10) * -1),
            duration: 100,
            relative: true
          }
        }, {
          interrupt: false
        });
      }
    }
    
    static get permission(){
        return "granted";
    }
    

    get data(){
        return this._data;
    }

    close(cb) {
        console.log("CLOSE FUNCTION IS HIT", this)
        
        var notificationsVersion = window.localStorage.getItem('notificationsVersion')
        var notificationsLocation = window.localStorage.getItem('notificationsLocation')
        var notificationsHeight = parseInt(window.localStorage.getItem('notificationsHeight'))
        
        if (notificationsVersion === "V2") {
          var conflict = false;
          var conflictIdx = -1;
          console.log("Notify.openWindows before pruning", Notify.openWindows)
          for (var i = 0; i < Notify.openWindows.length; i++) {
            var childWindow = Notify.openWindows[i];
            if (childWindow.name === this.notification.name) {
              childWindow.close();
              conflictIdx = i;
              conflict = true;
            }
          }
          console.log("Notify.openWindows AFTER PRUNING", Notify.openWindows)
          
          if (conflict && (notificationsLocation === "top-right" || notificationsLocation === "top-left")) {
            var windowsToShift = Notify.openWindows.slice(conflictIdx + 1);
            console.log("windowsToShift", windowsToShift);
            
            for (var i = 0; i < windowsToShift.length; i++) {
              windowsToShift[i].animate({
                position: {
                  left: 0,
                  top: ((notificationsHeight + 10) * -1),
                  duration: 100,
                  relative: true
                }
              }, {
                interrupt: false
              });
            } 
            
            Notify.openWindows.splice(conflictIdx, 1);
          } else if (conflict && (notificationsLocation === "bottom-right" || notificationsLocation === "bottom-left")) {
            var windowsToShift = Notify.openWindows.slice(0, conflictIdx);
            console.log("windowsToShift IN BOTTOM SHIFT", windowsToShift);
            
            for (var i = 0; i < windowsToShift.length; i++) {
              windowsToShift[i].animate({
                position: {
                  left: 0,
                  top: (notificationsHeight + 10),
                  duration: 100,
                  relative: true
                }
              }, {
                interrupt: false
              });
            }
            
            Notify.openWindows.splice(conflictIdx, 1);
          }
        }
    }

    addEventListener(event, cb) {
      var notificationsVersion = window.localStorage.getItem('notificationsVersion')
      var notificationName = this.notification.name
      let popoutFunctionality = function(data) {
        let popoutChat = window.localStorage.getItem('popoutChatNotification');
        if (popoutChat === 'true') {
          let waitForElement = (streamId, count, cb) => {
            let element = document.querySelector(`[id$="${streamId}"]`)
            if(element) {            
              cb(element);
            } else {
              if(count<15) {
                count++;
                setTimeout(()=>waitForElement(streamId, count, cb),450)
              }
            }
          };
          let streamId = data.streamId.replace(/\W/g, '');
          waitForElement(streamId, 0, () => {
            let popoutIcon = document.getElementsByClassName('enhanced-pop-out')[0];
            let inMainWindow = !window.location.pathname.includes('float');
            if (popoutIcon && inMainWindow) {
              popoutIcon.click();
            }
          });
        }
      }
      if (notificationsVersion === "V1") {
        if(event === 'click' && this.notification) {
            this.notification.noteWin.onClick = () => {
            popoutFunctionality(this._data);
            if (this.sticky) {
              this.notification.close();                    
            }
                cb({target:{callbackJSON:this._data}}); 
            }
        }
      } else if (notificationsVersion === "V2") {        
        if (event === 'click') {
          // On click of the body of the notification, the notification window is set to minimize, 
          // but on click of the "X", it closes. That way, we can choose to dismiss 
          // notifications instead of always directing to the chat window.
          
          fin.desktop.InterApplicationBus.subscribe("*", `${notificationName} body`, (message, uuid, name) => {
            console.log(`IN ${notificationName} body click IAB`)
			popoutFunctionality(this._data);
            cb({
              target: {
                callbackJSON: this._data
              }
            });
            this.close();
          });
        }
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
      console.log("Destroy called");
      console.log("arguments", arguments);
      console.log("Destroy called");
        // How is this different from close?
    }
}

Notify.openWindows = [];

window.addEventListener('load', () => {
  var notificationsVersion = window.localStorage.getItem('notificationsVersion')
  var notificationsHeight = parseInt(window.localStorage.getItem('notificationsHeight'))
  var thisWindow = fin.desktop.Window.getCurrent();
  let creatingPositioningWindow = false;
  
  if (thisWindow.name !== 'system-tray' && notificationsVersion === "V2") {
    fin.desktop.InterApplicationBus.subscribe("*", `notificationsLocation`, (message, uuid, name) => {
      fin.desktop.System.getMonitorInfo(function (monitorInfo) {
        window.localStorage.setItem('monitorInfo', JSON.stringify(monitorInfo));
        console.log("RECEIVED LOCATION", message)
        window.localStorage.setItem('notificationsLocation', message.notificationsLocation);
        window.localStorage.setItem('notificationsMonitor', message.notificationsMonitor);
        repositionWindows();
      });
    });
    
    window.addEventListener('click', evt => {
      var buttonElement = evt.target.closest('button');
      
      if (buttonElement && buttonElement.innerHTML === "Configure desktop alert positions" && creatingPositioningWindow === false) {
        creatingPositioningWindow = true;
        let timeout = 50;
        
        fin.desktop.Application.getCurrent().getChildWindows((childWindows) => {
          for (var i = 0; i < childWindows.length; i++) {
            if (childWindows[i].name === "Notification Positioning Window") {
              console.log("CLOSING EXTRA WINDOWS");
              childWindows[i].close();
              timeout = 1200;
            }
          }
          
          setTimeout(createPositioningWindow, timeout);
        });
      }
    }, true);
    
    function repositionWindows() {
      fin.desktop.Application.getCurrent().getChildWindows((childWindows) => {
        var openNotificationWindows = [];
        for (var i = 0; i < childWindows.length; i++) {
          if (childWindows[i].name.startsWith("Notify-")) {
            openNotificationWindows.push(childWindows[i])
          }
        }
        
        console.log("openNotificationWindows", openNotificationWindows);
        
        var notificationsHeight = parseInt(window.localStorage.getItem('notificationsHeight'));
        var notificationsLocation = window.localStorage.getItem('notificationsLocation');
        var notificationsMonitor = parseInt(window.localStorage.getItem('notificationsMonitor'));
        console.log("notificationsMonitor", notificationsMonitor)
        var monitorInfo = JSON.parse(window.localStorage.getItem('monitorInfo'));
        var monitor;
        if (notificationsMonitor === 1) {
          monitor = monitorInfo.primaryMonitor;
        } else if (monitorInfo.nonPrimaryMonitors[notificationsMonitor - 2]) {
          monitor = monitorInfo.nonPrimaryMonitors[notificationsMonitor - 2];
        } else {
          monitor = monitorInfo.primaryMonitor;
        }
        
        console.log("monitor", monitor)
        
        var rightBound = monitor.availableRect.right;
        var rightBoundPlacement = rightBound - 310;
        var bottomBound = monitor.availableRect.bottom;
        var bottomBoundPlacement = bottomBound - notificationsHeight - 10;
        var leftBound = monitor.availableRect.left + 10;
        
        if (notificationsLocation === 'top-right') {
          for (var i = 0; i < openNotificationWindows.length; i++) {
            var openNotificationWindow = openNotificationWindows[i];
            openNotificationWindow.animate({
              position: {
                left: rightBoundPlacement,
                top: ((notificationsHeight + 10) * i) + 10,
                duration: 250
              }
            }, {
              interrupt: false
            });
          }
        } else if (notificationsLocation === 'top-left') {
          for (var i = 0; i < openNotificationWindows.length; i++) {
            var openNotificationWindow = openNotificationWindows[i];
            openNotificationWindow.animate({
              position: {
                left: leftBound,
                top: ((notificationsHeight + 10) * i) + 10,
                duration: 250
              }
            }, {
              interrupt: false
            });
          }
        } else if (notificationsLocation === 'bottom-left') {
          var bottomIdx = openNotificationWindows.length - 1;
          for (var i = 0; i < openNotificationWindows.length; i++) {
            var openNotificationWindow = openNotificationWindows[bottomIdx];
            openNotificationWindow.animate({
              position: {
                left: leftBound,
                top: (bottomBoundPlacement - ((notificationsHeight + 10) * i)),
                duration: 250
              }
            }, {
              interrupt: false
            });
            bottomIdx--;
          }
        } else if (notificationsLocation === 'bottom-right') {
          var bottomIdx = openNotificationWindows.length - 1;
          for (var i = 0; i < openNotificationWindows.length; i++) {
            var openNotificationWindow = openNotificationWindows[bottomIdx];
            openNotificationWindow.animate({
              position: {
                left: rightBoundPlacement,
                top: (bottomBoundPlacement - ((notificationsHeight + 10) * i)),
                duration: 250
              }
            }, {
              interrupt: false
            });
            bottomIdx--;
          }
        }
      });
    }
    
    function createPositioningWindow() {
      new window.fin.desktop.Window({
        autoShow: true,
        name: 'Notification Positioning Window',
        cornerRounding: {height: 2, width: 3},
        defaultWidth: 300,
        defaultHeight: 400,
        frame: true,
        resizeable: false,
        url: `${window.targetUrl}notification-positioning-window.html`,
        opacity: 1,
        alwaysOnTop: true,
        icon: `${window.targetUrl}favicon.ico`
      }, function () {
        console.log("Notification Positioning Window successfully created.");
        creatingPositioningWindow = false;
      }, function (error) {
        console.log("Error creating Notification Positioning Window: ", error);
      })
    }
  }
});

