const { exec, execSync } = require("child_process");

(async () => {
  const cmdList = [
    `mkdir myApi `,
    `cd myApi && ../bin/run init -t`,
    `cd myApi && yarn build`,
    `cd myApi && cdk bootstrap`,
    `
    cd myApi && cdk deploy --ci --require-approval never --colors \
  --outputs-file ./cdk-outputs.json`,
    `cd myApi && yarn test --colors`,
    `cd myApi && yes | cdk destroy --colors`,
    `rm -rf myApi`,
  ];
  for (const cmd of cmdList) {
    if (
      !(
        cmd === `cd myApi && ../bin/run init -t` && process.platform === "win32"
      )
    ) {
      await runCommand(cmd);
    } else {
      await runCommand(`cd myApi && ..\\bin\\run init -t`);
      continue;
    }
  }
})();

async function runCommand(cmd: string): Promise<void> {
  return new Promise(function (resolve) {
    exec(cmd, async (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.log(stdout);
        console.log(stderr);
        console.log(err);
        execSync(`rm -rf myApi`);
        process.exit(1);
      }
      console.log(stdout);
      console.log(stderr);
      resolve();
    });
  });
}
