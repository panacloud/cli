const { execSync } = require("child_process");
const expect = require("chai").expect;
(() => {
  runCommand(`mkdir hello`)
  runCommand(`cd hello && ../bin/run init -t mateen7861`);
  runCommand(`cd hello && yarn build`);
  runCommand(`cd hello && cdk deploy`);
  execSync(`cd hello && yarn test`);
  execSync("cd hello && cdk destroy");
  execSync("rmdir hello");
})();


function runCommand(cmd:string):void{
  try {
    execSync(cmd);
  } catch (error) {
    process.exit(1)
  }
}