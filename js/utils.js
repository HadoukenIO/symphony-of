/*
* Various utility functions
*/

window.evalAllTemplates = function(model) {
  var templateNodes = document.querySelectorAll('template.string-literal');
  for(templateNode of templateNodes) {
    let htmlLiteral = `\`${templateNode.innerHTML}\``;
    let htmlGenerator = new Function(...Object.keys(model), `return ${htmlLiteral}`);
    
    templateNode.outerHTML = htmlGenerator(...Object.values(model));
  }
};