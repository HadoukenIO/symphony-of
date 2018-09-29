const fs = require("fs");
const path = require("path");
const newLine = require("os").EOL;

const configuration = process.argv[2] || "local";
const version = require("./package.json").version;

// File and Directory Constants
const resDir = path.join(__dirname, "res");
const configDir = path.join(__dirname, "config");
const jsDir = path.join(__dirname, "js");
const publicDir = path.join(__dirname, "public");

const getTemplateFilePath = fileName => path.join(resDir, "template-" + fileName);

const settingsFileName = "settings.json";
const customizationFileName = "customization.js";
const settingsFilePath = path.join(configDir, settingsFileName);
const customizationFilePath = path.join(configDir, customizationFileName);

if(!fs.existsSync(configDir)) {
    console.log("No configuration files found. Generating new settings from defaults.");
    fs.mkdirSync(configDir);
    fs.copyFileSync(getTemplateFilePath(settingsFileName), settingsFilePath);
    fs.copyFileSync(getTemplateFilePath(customizationFileName), customizationFilePath);
}

if(configuration === "--init") {
    return;
}

// Parse and import application settings
const settingsFile = require(settingsFilePath);
const settings = Object.assign(settingsFile.default, settingsFile[configuration]);

// Generate the Preload Bundle File
const buildFiles = [
    "window.js",
    "notify.js",
    "manifest.js",
    "screensnippet.js",
    "main.js",
    "utils.js",
    "events.js",
    "download-bar.js"
];

let fileContents = [
  '/*',
  '* WARNING: This file is auto-generated, any changes made to this',
  '*          file will be overwritten by the build script!',
  '*/',
  '',
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
    fs.readFileSync(path.join(jsDir, filePath), "utf8")
    ].join(newLine))
  .join(newLine);

const bundlePath = path.join(publicDir, "bundle.js");

fs.writeFileSync(bundlePath, fileContents, "utf8");

// Copy over the Customization Preload
const customizationFileOutputPath = path.join(publicDir, "customization.js");
fs.copyFileSync(customizationFilePath, customizationFileOutputPath);

// Generate App Manifest

let manifest = require(getTemplateFilePath("app.json"));

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

if(settings.navigationWhitelist.length > 0) {
    manifest.startup_app.contentNavigation = { whitelist: settings.navigationWhitelist };
}

manifest.runtime.arguments += settings.runtimeArguments; // Arguments are appended, not overwritten
manifest.shortcut.icon = settings.shortcutIconUrl;
manifest.appAssets[0].src = `${settings.targetUrl}OF-ScreenSnippet.zip`;

fs.writeFileSync(
    path.join(publicDir, "app.json"),
    JSON.stringify(manifest, null, 2)
);


// Generate Launcher Page
const launchAppUrl = `${settings.targetUrl}symphony-launch.html`;

let launchManifest = require(path.join(publicDir, "symphony-launch.json"));
launchManifest.startup_app.url = launchAppUrl;
launchManifest.startup_app.uuid = 'Symphony-OpenFin-Landing';
launchManifest.dialogSettings.logo = settings.iconUrl;
fs.writeFileSync(
    path.join(publicDir, "symphony-launch.json"),
    JSON.stringify(launchManifest, null, 2)
);

console.log(`Build Configuration "${configuration}" Complete!`)
console.log(`Deploy /public to: ${settings.targetUrl}`);
