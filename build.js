const fs = require("fs");
const path = require("path");
const newLine = require("os").EOL;

const env = process.argv[2];
const port = process.argv[3] || "8080";
const version = require("./package.json").version;

const settings = require("./config/settings.json");

switch (env) {
    case "staging": {
            settings.targetUrl = "https://cdn.openfin.co/demos/symphony-of-staging/";
            settings.appUuid = "Symphony-OpenFin-Landing-Staging";
        }
        break;
    case "local": {
            settings.targetUrl = `http://localhost:${port}/`;
            settings.appUuid = "Symphony-OpenFin-Landing-Local";
        }
        break;
    case "prod":
    default: {
        // Do not override any settings, keep them as-declared in settings.json
    }
}


// Generate the Preload Bundle File
const buildFiles = [
    path.join("js", "window.js"),
    path.join("js", "notify.js"),
    path.join("js", "manifest.js"),
    path.join("js", "screensnippet.js"),
    path.join("js", "main.js"),
    path.join("js", "utils.js"),
    path.join("js", "events.js"),
    path.join("js", "download-bar.js")
];

let fileContents = [
  '/*',
  '* WARNING: This file is auto-generated, any changes made to this',
  '*          file will be overwritten by the build script!',
  '*/',
  '',
  `window.symphonyOpenFinVersion = '${version}';`,
  `window.fin.symphony = ${JSON.stringify({version, settings}, null, 2)};`
].join(newLine) + newLine;

fileContents += buildFiles
  .map(filePath => [
    '/*',
    '* --------------------------------',
    `* ${filePath}`,
    '* --------------------------------',
    '*/',
    '',
    fs.readFileSync(path.join(__dirname, filePath), "utf8")
    ].join(newLine))
  .join(newLine);

const bundlePath = path.join(__dirname, "public", "bundle.js");

fs.writeFileSync(bundlePath, fileContents, "utf8");

// Copy over the Customization Preload
const customSrcPath = path.join(__dirname, "config", "customization.js");
const customDestPath = path.join(__dirname, "public", "customization.js");

fs.copyFileSync(customSrcPath, customDestPath);

// Generate App Manifest

let manifest = require(path.join(__dirname, "manifest-template.json"));
let contentNavigation = manifest.startup_app.contentNavigation;

// TODO: Ask Xavier about Content Navigation Rules

/*if (contentNavigation) {
    contentNavigation.whitelist = contentNavigation.whitelist.filter(
        x => !/localhost/.test(x)
    );
    contentNavigation.whitelist.push(targetUrl + "*");
}*/

Object.assign(manifest.startup_app, {
    url: settings.podUrl,
    uuid: settings.appUuid,
    name: settings.appUuid,
    icon: settings.iconUrl,
    preload: [
        {
            url: `${settings.targetUrl}bundle.js`,
            madatory: true
        },
        {
            url: `${settings.targetUrl}customization.js`,
            mandatory: false
        }
    ]
});

manifest.shortcut.icon = settings.shortcutIconUrl;

manifest.appAssets[0].src = `${settings.targetUrl}OF-ScreenSnippet.zip`;

fs.writeFileSync(
    path.join(__dirname, "public", "app.json"),
    JSON.stringify(manifest, null, 2)
);


// Generate Launcher Page
const launchAppUrl = `${settings.targetUrl}symphony-launch.html`;

let launchManifest = require(path.join(__dirname, "public", "symphony-launch.json"));
launchManifest.startup_app.url = launchAppUrl;
launchManifest.startup_app.uuid = 'Symphony-OpenFin-Landing';
launchManifest.dialogSettings.logo = settings.iconUrl;
fs.writeFileSync(
    path.join(__dirname, "public", "symphony-launch.json"),
    JSON.stringify(launchManifest, null, 2)
);

console.log(`built env: ${settings.targetUrl}`);
