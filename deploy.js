const repl = require('repl');
const { execSync } = require('child_process');


const msg = 'message';

let depgen;
let replServer;





// const { exec } = require('child_process');
// exec('cat *.js bad_file | wc -l', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);
// });




// Promise.resolve().then(() => {
//     return new Promise((r) => {

//     })
// })



function reader (input) {
    if (input !== 'y') {process.exit()}
    depgen.next();
}

function* deploy () {
    let command = `git fetch --all`;

    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader)
    yield;

    command = `git checkout upstream/develop`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm version from-git --force --no-git-tag-version`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm version patch --force -m "staging build %s"`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `git show --no-pager`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm run build staging`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `git push upstream --tags`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `git push upstream HEAD:develop`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

}

// console.log(`start deploy?`);
replServer = repl.start({ prompt: '> ', eval: reader })
depgen = deploy();
// replServer.write('start deploy? ');
replServer.question('start deploy? ', reader)



/*

///// * `git fetch --all`
/////* `git checkout upstream/develop`
* check the version in `package.json`
* update the `containerVer` in `main.js` to one patch greater and save (ex. 0.0.14 -> 0.0.15)
* `npm run build staging`
* `git add .` (just some urls could _possibly_ change here + the version)
* `git diff` (sanity check)
* `npm version patch --force -m "staging build %s: <brief description of changes>"`
* push tags upstream `git push upstream --tags`
* push branch upstream `git push upstream HEAD:develop`
* copy the contents of the `public/` directory to the staging s3 bucket  (`https://s3.amazonaws.com/cdn.openfin.co/demos/symphony-of-staging`)
`aws s3 cp [local path]/public s3://cdn.openfin.co/demos/symphony-of-staging/ --recursive --exclude "node_modules/*" --exclude ".git/*"`
* Invalidate the cloudfront cdn for `/demos/symphony-of-staging/*`

*/