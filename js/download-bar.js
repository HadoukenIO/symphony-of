window.once2 = false;

window.addEventListener('load', () => {
    const currentWindow = fin.desktop.Window.getCurrent();

    if (currentWindow.uuid === currentWindow.name && !parent.once2) {

        const local = {
            downloadItems: []
        };

        currentWindow.addEventListener('file-download-started', (downloadEvt) => {
            if (!downloadEvt.mimeType.includes('image')) {
                initiate();
                createDOM(downloadEvt);
            }
        }, () => {
            console.log('file download started event registered');
        });

        currentWindow.addEventListener('file-download-progress', (downloadEvt) => {
            const downloadItemKey = `uuid-${downloadEvt.fileUuid}`;
            const downloadItem = document.querySelector(`#${downloadItemKey}`);
            const fileProgressTitle = downloadItem.querySelector('#per');
            let { downloadedBytes, totalBytes } = downloadEvt;
            let percent = totalBytes === 0 ? 100 : Math.floor((downloadedBytes / totalBytes) * 100);
            fileProgressTitle.innerHTML = percent + '% Downloaded';
        }, () => {
            console.log('file download progress event registered');
        });

        currentWindow.addEventListener('file-download-completed', (downloadEvt) => {
            const { fileUuid } = downloadEvt;
            const downloadItemKey = `uuid-${fileUuid}`;
            const downloadItem = document.querySelector(`#${downloadItemKey}`);
            const downloadMain = document.getElementById('download-main');
            const mainFooter = document.getElementById('footer');

            if (downloadItem && downloadEvt.state === 'cancelled') {
                downloadItem.remove();
                if (!downloadMain.hasChildNodes()) {
                    mainFooter.classList.add('hidden');
                }
            } else if (downloadItem && downloadEvt.state === 'completed') {
                const downProgress = downloadItem.querySelector('#download-progress');
                const itemDiv = downloadItem.querySelector('#item-div');
                const fileIcon = downloadItem.querySelector('#file-icon');

                downProgress.classList.remove('flash');
                fileIcon.classList.remove('download-complete-color');
                fileIcon.classList.remove('tempo-icon--download');
                fileIcon.classList.add('tempo-icon--document');

                itemDiv.addEventListener('click', () => {
                    openFile(fileUuid);
                    downloadItem.remove();
                    if (!downloadMain.hasChildNodes()) {
                        mainFooter.classList.add('hidden');
                    }
                });

                openFile(fileUuid);
            }
        }, () => {
            console.log('file download completed event registered');
        });

        function openFile(id) {
            fin.desktop.System.launchExternalProcess({
                fileUuid: id,
                arguments: "",
                listener: (result) => {
                    console.log('the exit code', result.exitCode);
                }
            }, (payload) => {
                console.log('Success:', payload.uuid);
            }, (r, error) => {
                console.log('Error:', r);
            });
        }

        function createDOM(arg) {

            if (arg && arg.fileUuid) {
                const fileDisplayName = arg.fileName;
                const downloadItemKey = `uuid-${arg.fileUuid}`;

                local.downloadItems.push(arg);

                let ul = document.getElementById('download-main');
                if (ul) {
                    let li = document.createElement('li');
                    li.id = downloadItemKey;
                    li.classList.add('download-element');
                    ul.insertBefore(li, ul.childNodes[0]);

                    let itemDiv = document.createElement('div');
                    itemDiv.classList.add('download-item');
                    itemDiv.id = 'item-div';
                    li.appendChild(itemDiv);

                    let fileDetails = document.createElement('div');
                    fileDetails.classList.add('file');
                    itemDiv.appendChild(fileDetails);

                    let downProgress = document.createElement('div');
                    downProgress.id = 'download-progress';
                    downProgress.classList.add('download-complete');
                    downProgress.classList.add('flash');
                    fileDetails.appendChild(downProgress);

                    let fileIcon = document.createElement('span');
                    fileIcon.id = 'file-icon';
                    fileIcon.classList.add('tempo-icon');
                    fileIcon.classList.add('tempo-icon--download');
                    fileIcon.classList.add('download-complete-color');
                    downProgress.appendChild(fileIcon);

                    let fileNameDiv = document.createElement('div');
                    fileNameDiv.classList.add('downloaded-filename');
                    itemDiv.appendChild(fileNameDiv);

                    let h2FileName = document.createElement('h2');
                    h2FileName.classList.add('text-cutoff');
                    h2FileName.innerHTML = fileDisplayName;
                    h2FileName.title = fileDisplayName;
                    fileNameDiv.appendChild(h2FileName);

                    let fileProgressTitle = document.createElement('span');
                    fileProgressTitle.id = 'per';
                    fileProgressTitle.innerHTML = '0% Downloaded';
                    fileNameDiv.appendChild(fileProgressTitle);
                }
            }
        }

        function initiate() {
            let mainFooter = document.getElementById('footer');
            let mainDownloadDiv = document.getElementById('download-manager-footer');

            if (mainDownloadDiv) {

                mainFooter.classList.remove('hidden');

                let ulFind = document.getElementById('download-main');

                if (!ulFind) {
                    let uList = document.createElement('ul');
                    uList.id = 'download-main';
                    mainDownloadDiv.appendChild(uList);
                }

                let closeSpanFind = document.getElementById('close-download-bar');

                if (!closeSpanFind) {
                    let closeSpan = document.createElement('span');
                    closeSpan.id = 'close-download-bar';
                    closeSpan.classList.add('close-download-bar');
                    closeSpan.classList.add('tempo-icon');
                    closeSpan.classList.add('tempo-icon--close');
                    mainDownloadDiv.appendChild(closeSpan);
                }

                let closeDownloadManager = document.getElementById('close-download-bar');
                if (closeDownloadManager) {
                    closeDownloadManager.addEventListener('click', () => {
                        local.downloadItems = [];
                        document.getElementById('footer').classList.add('hidden');
                        document.getElementById('download-main').innerHTML = '';
                    });
                }
            }
        }
    }
    window.once2 = true;
});