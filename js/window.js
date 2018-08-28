/* override window.open to fix name issue */
var originalOpen = window.open;

if(fin.desktop.Window.getCurrent().uuid === fin.desktop.Window.getCurrent().name) {
  window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
}

window.open = (...args) => {
  window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};  
  let w = originalOpen.apply(this, args);
   // Try catch for cross domain safeguard
  if (w && !w.name.includes('Notifications') && !w.name.startsWith('Notify') && w.name !== 'queueCounter' && w.name !== 'system-tray' && args[1] !== 'main' && w.name !== 'Notification Positioning Window') {
    let stream;
    args.forEach(arg => {
      if (typeof arg === "string" && arg.includes("floaterStreamId")) {
        let url = new URLSearchParams(arg);
        stream = url.get('floaterStreamId');
      }
    });

    let streamId = (stream) ? stream : 'inbox';
    let uuid = fin.desktop.Application.getCurrent().uuid;
    let namesObj = { name: w.name, symName: args[1], hide: false, uuid: uuid }
    window.popouts[streamId] = window.popouts[streamId] ? Object.assign(window.popouts[streamId], namesObj) : namesObj;
    window.localStorage.setItem('wins', JSON.stringify(window.popouts));
  }

  return w;
}

window.winFocus = (ofWin) => {
  ofWin.getState(state => {
    if (state === 'minimized') {
        ofWin.restore(() => {ofWin.setAsForeground();},e=>console.log(e));                            
    } else {
        ofWin.setAsForeground();    
    }
  })
}
