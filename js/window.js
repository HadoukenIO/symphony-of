/* override window.open to fix name issue */
var originalOpen = window.open;
window.open = (...args) => {
   let w = originalOpen.apply(this, args);
    //Try catch for cross domain safeguard
    try {
       w.name = args[1];
     } catch (e) {
        console.log(e)
     }

     return w;
}
