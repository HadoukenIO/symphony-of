/* override window.open to fix name issue */
var originalOpen = window.open;
window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
if (!window.processProtocolAction) {
    window.processProtocolAction = () => {};
} 

window.open = (...args) => {
    console.log('win open', ...args)
    window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};  
    let w = originalOpen.apply(this, args);
    // Try catch for cross domain safeguard
    if(!w.name.includes('Notifications') && w.name !== 'queueCounter' && args[1] !== 'main') {
        let stream = args[0].split('&')[1];
        if(stream) {
            let startIdx = stream.indexOf('=') + 1;
            let streamId = (startIdx > 5) ? stream.slice(startIdx) : 'inbox';
            let uuid = fin.desktop.Application.getCurrent().uuid;
            let namesObj = { name: w.name, symName: args[1], hide: false, uuid: uuid }
            window.popouts[streamId] = window.popouts[streamId] ? Object.assign(window.popouts[streamId], namesObj) : namesObj;
            window.localStorage.setItem('wins', JSON.stringify(window.popouts));
        }

        try {
            w.name = args[1];
        } catch (e) {
            console.log(e)
        }
    }

  return w;
}
window.createProtocolUri = (streamId, type) => {
    if(!type) {
        if (window.popouts[streamId] && window.popouts[streamId].type) {
            var type = window.popouts[streamId].type;
        } else {
            return false;
        }
    }
    return `symphony://?streamId=${streamId}&streamType=${type}`;    
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
