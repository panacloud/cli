const { exec, execSync } = require("child_process");
const fs = require("fs");

(async () => {
  const cmdList = [
    `mkdir myApi `,
    `cd myApi && ../bin/run init -t`,
    `cd myApi && yarn build`,
    `cd myApi && cdk bootstrap`,
    `
    cd myApi && cdk deploy --ci --require-approval never --colors \
  --outputs-file ./tests/apiTests/appsyncCredentials.json`,
    `cd myApi && yarn test --colors`,
    `cd myApi && yes | cdk destroy --colors`,
    `rm -rf myApi`
  ];
  for (const cmd of cmdList) {
    await runCommand(cmd)
  }

})();

async function runCommand(cmd: string): Promise<void> {
  return new Promise(function (resolve) {
    exec(cmd, async (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.log(stdout);
        console.log(stderr);
        console.log(err)
        // execSync(`rm -rf myApi`)
        process.exit(1)
      }
      console.log(stdout);
      console.log(stderr);
      resolve();
    });
  });
}
