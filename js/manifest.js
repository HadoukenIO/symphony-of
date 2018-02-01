fin.desktop.System.getMonitorInfo(function (monitorInfo) {
  window.localStorage.setItem('monitorInfo', JSON.stringify(monitorInfo));
});



fin.desktop.Application.getCurrent().getManifest(function (manifest) {
  console.log("IN GET MANIFEST", manifest.startup_app.symphonyNotifications)
  console.log("IN GET MANIFEST", manifest.startup_app.symphonyNotifications)
  console.log("IN GET MANIFEST", manifest.startup_app.symphonyNotifications)
  console.log("IN GET MANIFEST", manifest.startup_app.symphonyNotifications)
  window.localStorage.setItem('notificationsVersion', "V1");
  window.localStorage.setItem('notificationsHeight', 80);
  
    if (manifest.startup_app.symphonyNotifications == "V2") {
      console.log("IN IF1")
      window.localStorage.setItem('notificationsVersion', "V2");
      window.localStorage.setItem('notificationsHeight', 60);
      console.log("IN IF2")
      console.log("IN IF3")
    }
});