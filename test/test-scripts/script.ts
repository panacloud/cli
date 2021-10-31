const fs = require("fs");
const expect = require("chai").expect;
const {execSync} = require("child_process");

(() => {

  runCommand(`mkdir hello `)
  runCommand(`cd hello && ../bin/run init -t mateen7861`);
  runCommand(`cd hello && npx gqlg --schemaFilePath ../test/test-schemas/todo.graphql --destDirPath ./tests/apiTests/graphql/output/`)
  fs.writeFile("./hello/tests/apiTests/appsyncCredentials.json","",(err:any)=>{
    if(err){
      process.exit(1)
    }
  })
  runCommand(`cd hello && yarn build `);
  runCommand(`cd hello && cdk deploy \
  --outputs-file ./tests/apiTests/appsyncCredentials.json`);
  execSync(`cd hello && yarn test --colors`);
  execSync("cd hello && cdk destroy   --colors");
  execSync("rm -rf hello   --colors");
})();


function runCommand(cmd:string):void{
  try {
    const res = execSync(cmd, { encoding: 'utf-8' });
    console.log(res)
  } catch (error) {
    execSync("rm -rf hello");
    process.exit(1)
  }
}