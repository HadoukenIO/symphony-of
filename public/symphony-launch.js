const launchSymphonyOpenFin = () => {
    let podUrl = document.getElementById('podUrl');
    let landingApp = fin.desktop.Application.getCurrent();
    let serviceOrigin = 'https://symphony.openfin.co';
    let queryString = `nwl=true&startup_app.url=${podUrl.value}`;

    const stagingPath = `/demos/symphony-of-staging/symphony-launch.html`;
    const pathname = location.pathname;
    const isStaging = pathname === stagingPath;
    const serviceRoute = isStaging ? 'app-staging' : 'app';
    const manifestUrl = encodeURI(`${serviceOrigin}/${serviceRoute}?${queryString}`);

    fin.desktop.Application.createFromManifest(manifestUrl, app => {
        app.run(()=>landingApp.close(), e => alert('Failed to create app from manifest: ' + e));
    }, error => {
        alert('Failed to create app from manifest: ' + error);
    });
    return false
}