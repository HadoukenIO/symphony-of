const launchSymphonyOpenFin = () => {
    let podUrl = document.getElementById('podUrl');
    let landingApp = fin.desktop.Application.getCurrent();
    let serviceOrigin = 'https://symphony.openfin.co';
    let queryString = `startup_app.url=${podUrl.value}`;
    let origin = location.origin;

    if (origin === 'https://cdn.openfin.co/demos/symphony-of-staging') {
        queryString += `&startup_app.preload=${origin}/bundle.js`;
        queryString += `&startup_app.name=OpenFin Symphony Client Staging`;
        queryString += `&startup_app.uuid=OpenFin Symphony Client Staging`;
        queryString += `&splashScreenImage=${origin}/symphony-splash.png`;
        queryString += `&dialogSettings.logo=${origin}/symphony-dialog.png`;
        queryString += `&shortcut.name=Symphony OF Staging`;
    }

    fin.desktop.Application.createFromManifest(`${serviceOrigin}/app?${queryString}`, app => {
        app.run(()=>landingApp.close(), e => alert('Failed to create app from manifest: ' + e));
    }, error => {
        alert('Failed to create app from manifest: ' + error);
    });
    return false
}