/* override window.open to fix name issue */
var originalOpen = window.open;
window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};
window.connections = JSON.parse(window.localStorage.getItem('connects')) || {notifications:[]};
window.localStorage.setItem('connects', JSON.stringify(window.connections));

if (!window.processProtocolAction) {
    window.processProtocolAction = () => {};
}

window.open = (...args) => {
  window.popouts = JSON.parse(window.localStorage.getItem('wins')) || {};  
  let w = originalOpen.apply(this, args);
   // Try catch for cross domain safeguard
  if(w && !w.name.includes('Notifications') && w.name !== 'queueCounter' && args[1] !== 'main') {
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

window.httpGet = url => {
    return new Promise(resolve => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                resolve(JSON.parse(xmlHttp.responseText));
            }
        }
        xmlHttp.open('GET', url, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json'); 
        xmlHttp.send(null);
    })
}

window.httpPost = (url, body) => {
    return new Promise(resolve => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                resolve(JSON.parse(xmlHttp.responseText));
            }
        }
        xmlHttp.open('POST', url, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json');
        xmlHttp.send(JSON.stringify(body));
    });
}

// window.httpPostMsg = (url, body) => {
//     return new Promise(resolve => {
//         var xmlHttp = new XMLHttpRequest();
//         xmlHttp.onreadystatechange = function() { 
//             if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//                 resolve(JSON.parse(xmlHttp.responseText));
//             }
//         }
//         xmlHttp.open('POST', url, true);
//         xmlHttp.setRequestHeader('Content-Type', 'multipart/form-data');   
//         console.log(xmlHttp.request); 
//         xmlHttp.send(body);
//     });
// }

window.startChat = userIdArray => {
    window.httpPost('/pod/v1/im/create', userIdArray)
    .then(data => {
        let streamId = data.id.replace(/_/g,'/').replace(/-/g,'+') + '==';
        window.processProtocolAction(window.createProtocolUri(streamId, 'im'));
    });
}

window.getAllStreams = () => {
    return window.httpPost('/pod/v1/streams/list', {});
}

window.getAllConnections = () => {
    return window.httpGet('/pod/v1/connection/list?status=all', {});
}

window.findUserByEmail = email => {
    return window.httpGet(`/pod/v2/user/?email=${email}`);
}

window.findUserById = uid => {
    return window.httpGet(`/pod/v2/user/?uid=${uid}`);
}

window.findUserByQuery = query => {
    return window.httpPost(`/pod/v1/user/search?limit=100`, { query });
}

// window.sendMessage = (streamId, msg) => {
//     let id = streamId.split('/').join('_').split('+').join('-').slice(0,-2);
//     return window.httpPostMsg(`https://openfin.symphony.com/agent/v4/stream/${id}/message/create`, { message: msg });        
// }

