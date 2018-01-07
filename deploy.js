const repl = require('repl');
const { exec, execSync } = require('child_process');

console.log(`running in ${process.cwd()}`);

const replServer = repl.start({ eval: reader })
const depgen = deploy();

replServer.question('start deploy? (will reset --hard HEAD in current environment) ', reader);

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

    command = `npm version patch --force -m "staging build %s"`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `npm run build staging`;
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

    command = `git push upstream HEAD:develop_test`;
    console.log(command);
    execSync(command);
    replServer.question('ok? ', reader);
    yield;

    command = `aws s3 cp ./public s3://cdn.openfin.co/demos/symphony-of-staging/ --recursive`;
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

    command = `aws cloudfront create-invalidation --distribution-id E16N7NZUXTHZCF --paths /demos/symphony-of-staging/*`;
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
