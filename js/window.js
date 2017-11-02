/* override window.open to fix name issue */
var originalOpen = window.open;
window.popouts = JSON.parse(localStorage.getItem('wins')) || {};
window.curWin;

window.open = (...args) => {
  let w = originalOpen.apply(this, args);
   //Try catch for cross domain safeguard
  if(!w.name.includes('Notifications') && w.name !== 'queueCounter') {
      
    try {
        w.name = args[1];
      } catch (e) {
        console.log(e)
      }
  }
    return w;
}
