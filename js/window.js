/* override window.open to fix name issue */
var originalOpen = window.open;
window.popouts = JSON.parse(localStorage.getItem('wins')) || {};
window.curWin;
window.streamId;

window.open = (...args) => {
  console.log('args', args)
  let w = originalOpen.apply(this, args);
  console.log('win', w)
   //Try catch for cross domain safeguard
  if(!w.name.includes('Notifications') && w.name !== 'queueCounter' && w.name !== 'main') {
    // let stream = args[0].split('&')[1];
    // let startIdx = stream.indexOf('=') + 1;
    // let streamId = stream.slice(startIdx);
    // window.popouts[streamId] = { name: w.name };

    try {
        w.name = args[1];
      } catch (e) {
        console.log(e)
      }
  }

  return w;
}

function winFocus(ofWin) {
  ofWin.getState(state => {
    if (state === 'minimized') {
        ofWin.restore(() => {ofWin.setAsForeground();},e=>console.log(e));                            
    } else {
        ofWin.setAsForeground();    
    }
  })
}
