/*
* Class representing a Symphony screen snippet
*/

let holdChrome = chrome;

class ScreenSnippet {
    constructor() {
        this.data;
        this.flag = false;
        this.id = Math.floor(Math.random()*10000)

        this.listener = msg => {
            this.data = msg;
        }
        fin.desktop.InterApplicationBus.subscribe('*', 'snippet' + this.id, this.listener);            
    }

    capture() {
        if (this.flag) return;

        function getPort() {
            return new Promise((resolve, reject) => {
                holdChrome.desktop.getDetails(d => resolve(d.port));
            });
        }

        function launchSnippetTool(port, id) {
            return new Promise((resolve, reject) => {
                fin.desktop.System.launchExternalProcess({
                    alias: 'ScreenSnippet',
                    arguments: port + ' OpenFin-Symphony-udbrf2z9sehilik9 snippet' + id,
                    lifetime: 'window',
                    listener: function (result) {
                        console.log('the exit code', result.exitCode);
                    }
                }, (payload) => {
                    resolve()
                }, (reason, error) => reject(reason, error));
            });
        };

        const waitForData = (resolve) => {
            if (!this.data) {
                setTimeout(() => waitForData(resolve),100);
            } else {
                resolve(this.data)
            }
        }

        return getPort().then(port => {
            launchSnippetTool(port, this.id)
        })
        .then(() => {
            return new Promise (resolve => {
                waitForData(resolve)
            })
        })
        .then(data => {
            fin.desktop.InterApplicationBus.unsubscribe('*', 'snippet' + this.id, this.listener);
            this.flag=true;
            return { type: 'image/jpg;base64', data };
        })
        .catch((reason, err) => console.log(reason, err));
    }
}
