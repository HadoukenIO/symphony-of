fin.desktop.System.getMonitorInfo(function (monitorInfo) {
  window.localStorage.setItem('monitorInfo', JSON.stringify(monitorInfo));
});
