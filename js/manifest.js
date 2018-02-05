fin.desktop.System.getMonitorInfo(function (monitorInfo) {
  window.localStorage.setItem('monitorInfo', JSON.stringify(monitorInfo));
});

fin.desktop.Application.getCurrent().getManifest(function (manifest) {
  window.localStorage.setItem('notificationsVersion', "V1");
  window.localStorage.setItem('notificationsHeight', 80);
  
  if (manifest.startup_app.customData) {
    if (manifest.startup_app.customData.symphonyNotifications === "V2") {
      window.localStorage.setItem('notificationsVersion', "V2");
      window.localStorage.setItem('notificationsHeight', 60);
    }
  }
  
});

if (window.localStorage.getItem('notificationsLocation') === null) {
  window.localStorage.setItem('notificationsLocation', "top-right");
}
if (window.localStorage.getItem('notificationsMonitor') === null) {
  window.localStorage.setItem('notificationsMonitor', 1);
}
