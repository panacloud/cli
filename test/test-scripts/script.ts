import fs from "fs"
const { execSync } = require("child_process");
const expect = require("chai").expect;

(() => {
  runCommand(`mkdir hello`)
  runCommand(`cd hello && ../bin/run init -t mateen7861`);
  runCommand(`cd hello && npx gqlg --schemaFilePath ../test/test-schemas/todo.grapqhl --destDirPath ./tests/apiTests/`)
  fs.writeFile("/hello/tests/apiTests/appsyncCredentials.json",{},(err)=>{
    if(err){
      process.exit(1)
    }
  })
  runCommand(`cd hello && yarn build`);
  runCommand(`cd hello && cdk deploy \
  --outputs-file ./tests/apiTests/appsyncCredentials.json`);
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