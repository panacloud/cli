const { exec,execSync } = require("child_process");
const fs = require("fs");

(async () => {
  const cmdList = [
    `mkdir hello1 `,
    `cd hello1 && ../bin/run init -t mateen7861`,
    `cd hello1 && npx gqlg --schemaFilePath ../test/test-schemas/todo.graphql --destDirPath ./tests/apiTests/graphql/output/`,
    `cd hello1 && yarn build`,
    `cd hello1 && cdk bootstrap`,
    `
    cd hello1 && cdk deploy --ci --require-approval never --colors \
  --outputs-file ./tests/apiTests/appsyncCredentials.json`,
  `cd hello1 && yarn test --colors`,
  `cd hello1 && yes | cdk destroy --colors`,
  `rm -rf hello1`
  ];
  for(const cmd of cmdList){
    if(cmd === cmdList[2]){
      fs.writeFile("./hello1/tests/apiTests/appsyncCredentials.json","{}",async (err:any)=>{
        if(err){
          await runCommand('rm -rf hello1')
          process.exit(1)
        }
      })
    }
    await runCommand(cmd)
  }
 
})();

async function runCommand(cmd: string): Promise<void> {
  return new Promise(function (resolve) {
    exec(cmd,async (err: any, stdout: any, stderr: any) => {
      if(err){
        console.log(stdout);
        console.log(stderr);
        console.log(err)
        execSync(`rm -rf hello1`)
        process.exit(1)
      }
      console.log(stdout);
      console.log(stderr);
      resolve();
    });
  });
}
