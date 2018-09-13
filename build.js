const fs = require("fs");
const path = require("path");

const env = process.argv[2];
const port = process.argv[3] || "8080";
const isLocalBuild = env === "local";
const isStagingBuild = env === "staging";
const version = require("./package.json").version;
const isProdBuild = !(isLocalBuild || isStagingBuild);

let targetUrl;
let launchAppUuid;

// NEED TO UPDATE VERSION FUNCTION IN MAIN.JS SOMEWHERE IN BUILD PROCESS

switch (env) {
    case "staging":
        {
            targetUrl = "https://cdn.openfin.co/demos/symphony-of-staging/";
            launchAppUuid = "Symphony-OpenFin-Landing-Staging";
        }
        break;
    case "local":
        {
            targetUrl = `http://localhost:${port}/`;
            launchAppUuid = "Symphony-OpenFin-Landing-Local";
        }
        break;
    case "prod":
    default: {
        targetUrl = "https://cdn.openfin.co/demos/symphony-of/";
        launchAppUuid = "Symphony-OpenFin-Landing";
    }
}

fs.writeFileSync(
    path.join(__dirname, "buildtarget.js"),
    `window.targetUrl='${targetUrl}';window.symphonyOpenFinVersion='${version}';`
);

const buildFiles = [
    path.join(__dirname, "buildtarget.js"),
    path.join(__dirname, "js", "targetUrl.js"),
    path.join(__dirname, "js", "window.js"),
    path.join(__dirname, "js", "notify.js"),
    path.join(__dirname, "js", "manifest.js"),
    path.join(__dirname, "js", "screensnippet.js"),
    path.join(__dirname, "js", "main.js"),
    path.join(__dirname, "js", "events.js"),
    path.join(__dirname, "js", "download-bar.js")
];

let fileContents = "";

buildFiles.forEach(filePath => {
    const data = fs.readFileSync(filePath, "utf8");
    if (typeof data === "string" && data.length > 0) {
        fileContents += data;
    } else {
        console.log(`Error reading ${filePath}. Please be sure the file exists.`);
    }
});

const bundlePath = path.join(__dirname, "public", "bundle.js");

fs.writeFileSync(bundlePath, fileContents, "utf8");
fs.unlinkSync(path.join(__dirname, "buildtarget.js"));

if (isLocalBuild) {
    let app = require(path.join(__dirname, "public", "app.json"));
    let contentNavigation = app.startup_app.contentNavigation;

    app.startup_app.preload = `${targetUrl}bundle.js`;
    app.startup_app.url = "https://openfin.symphony.com";
    if (contentNavigation) {
        contentNavigation.whitelist = contentNavigation.whitelist.filter(
            x => !/localhost/.test(x)
        );
        contentNavigation.whitelist.push(targetUrl + "*");
    }
    app.startup_app.preload = `${targetUrl}bundle.js`;
    app.startup_app.name = `OpenFin-Sym-Client-Local`;
    app.startup_app.uuid = `OpenFin-Sym-Client-Local`;
    fs.writeFileSync(
        path.join(__dirname, "public", "local.json"),
        JSON.stringify(app, null, "    ")
    );
}

const launchAppUrl = `${targetUrl}symphony-launch.html`;
const launchAppDialogLogo =
    "https://raw.githubusercontent.com/symphonyoss/SymphonyElectron/master/build/icon.ico";

let app = require(path.join(__dirname, "public", "symphony-launch.json"));
app.startup_app.url = launchAppUrl;
app.startup_app.uuid = launchAppUuid;
app.dialogSettings.logo = launchAppDialogLogo;
fs.writeFileSync(
    path.join(__dirname, "public", "symphony-launch.json"),
    JSON.stringify(app, null, "    ")
);

console.log(`built env: ${targetUrl}`);
