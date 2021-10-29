const { execSync } = require("child_process");
const expect = require("chai").expect;
(() => {
  execSync("mkdir hello");
  execSync(`cd hello && ../bin/run init -t mateen7861`);
  execSync(`cd hello && yarn build`);
  execSync(`cd hello && cdk deploy`);
  execSync(`cd hello && yarn test`);
  execSync("cd hello && cdk destroy");
  execSync("rmdir hello");
})();
