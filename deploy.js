const repl = require('repl');
const { exec, execSync } = require('child_process');
const buildType = process.argv[2] || 'staging';

if (!['staging', 'prod'].includes(buildType)) {
    console.log(`${buildType} is not a valid build target`);
    process.exit(1);
}

let upstreamBranch;
let s3Target;

if (buildType === 'prod') {
    upstreamBranch = 'master';
    s3Target = 'symphony-of';
} else {
    upstreamBranch = 'develop';
    s3Target = 'symphony-of-staging';
}

console.log(`running in ${process.cwd()}`);
console.log(`build type: ${buildType}, upstream branch: ${upstreamBranch}, s3 target: ${s3Target}`);

const replServer = repl.start({ eval: reader })
const depgen = deploy();

replServer.question('start deploy? ', reader);

function reader(input) {
    if (input !== 'y') { process.exit(1) }
    depgen.next();
}

function* deploy() {
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

    command = `git rev-list --tags --max-count=1`;
    const latestTagSha = execSync(command);

    command = `git describe ${latestTagSha.toString()}`;
    const latestTag = execSync(command);
    console.log('the tag', latestTag.toString());

    command = `npm version --no-git-tag-version --allow-same-version ${latestTag.toString()}`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm version patch --force -m "${buildType} build %s"`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm run build ${buildType}`;
    exec(command, (error, stdout) => {
        if (error) {
            console.error(`exec error: ${error}`);
            process.exit(1)
            return;
        }
        console.log(stdout);
        replServer.question('ok? ', reader);
    });
    yield;

    command = `git --no-pager diff upstream/develop`;
    exec(command, (error, stdout) => {
        if (error) {
            console.error(`exec error: ${error}`);
            process.exit(1)
            return;
        }
        console.log(stdout);
        replServer.question('ok? ', reader);
    });
    yield;

    command = `git push upstream --tags`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `git push upstream HEAD:${upstreamBranch}`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `aws s3 cp ./public s3://cdn.openfin.co/demos/${s3Target}/ --recursive`;
    console.log(command);
    exec(command, (error, stdout) => {
        if (error) {
            console.error(`exec error: ${error}`);
            process.exit(1)
            return;
        }
        console.log(stdout);
        replServer.question('ok? ', reader);
    });
    yield;

    command = `aws cloudfront create-invalidation --distribution-id E16N7NZUXTHZCF --paths /demos/${s3Target}/*`;
    console.log(command);
    exec(command, (error, stdout) => {
        if (error) {
            console.error(`exec error: ${error}`);
            process.exit(1)
            return;
        }
        console.log(stdout);
        replServer.question('ok? ', reader);
    });
    yield;

    console.log('successful deployment, go test it!');
    process.exit(0);
}
