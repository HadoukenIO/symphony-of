/*
* Class representing a Symphony screen snippet
*/

class ScreenSnippet {
    constructor() {
        this.data;
        this.flag = false;

        // THIS WOULD GET ALL SNIPPETS... IS THIS MEANT TO BE SINGLETON OR MORE THAN ONE INSTANCE?
        this.listener = msg => {
            this.data = msg;
        }
        fin.desktop.InterApplicationBus.subscribe('*', 'snippet', this.listener);            
    }

    capture() {
        if (this.flag) return;

        function launchNodeService(port) {
            console.log('lns')
            return new Promise((resolve, reject) => {
                fin.desktop.System.launchExternalProcess({
                    alias: 'nodeScreenSnippet',
                    arguments: 'ScreenSnippet/start.js --port ' + 9696,
                    lifetime: 'window',
                    listener: function (result) {
                        console.log('the exit code', result.exitCode);
                    }
                }, (payload) => {
                    resolve(payload.uuid)
                }, (reason, error) => reject(reason, error));
            });
        };

        const waitForData = (resolve, uuid) => {
            if (!this.data) {
                setTimeout(() => waitForData(resolve, uuid),100);
            } else {
                // Terminate the node screen snippet process
                fin.desktop.System.terminateExternalProcess(uuid, 1, true, 
                    info => console.log("Termination result " + info.result), 
                    reason => console.log("failure: " + reason)
                )
        
                resolve(this.data)
            }
        }

        return launchNodeService()
        .then((uuid) => {
            console.log(uuid);
            return new Promise ((resolve, reject) => {
                waitForData(resolve, uuid)
            })
        })
        .then(data => {
            fin.desktop.InterApplicationBus.unsubscribe('*', 'snippet', this.listener);
            this.flag=true;
            return data;
        })
        .catch((reason, err) => console.log(reason, err));
    }
}
