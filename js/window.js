window.popouts =  {};

window.saveBounds = () => {};

window.winFocus = (ofWin) => {
  ofWin.getState(state => {
    if (state === 'minimized') {
        ofWin.restore(() => {ofWin.setAsForeground();},e=>console.log(e));                            
    } else {
        ofWin.setAsForeground();    
    }
  })
}
