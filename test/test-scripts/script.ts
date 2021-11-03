const { exec,execSync } = require("child_process");
const fs = require("fs");

(async () => {
  const cmdList = [
    `mkdir hello1 `,
    `cd hello1 && ../bin/run init -t mateen7861`,
    `cd hello1 && npx gqlg --schemaFilePath ../test/test-schemas/todo.graphql --destDirPath ./tests/apiTests/graphql/output/`,
  //   `
  //   cd hello1 && cdk deploy --ci --require-approval never --colors \
  // --outputs-file ./tests/apiTests/appsyncCredentials.json`,
  `cd hello1 && yarn test --colors`,
  `cd hello1 && cdk destroy --colors`,
  `rm -rf hello1`
  ];
  for(const cmd of cmdList){
    if(cmd === cmdList[2]){
      fs.writeFile("./hello1/tests/apiTests/appsyncCredentials.json","",async (err:any)=>{
        if(err){
          await runCommand('rm -rf hello1')
          process.exit(1)
        }
      })
    }
    await runCommand(cmd)
  }
  //   let index = 0;
  //   const cmdListLength = cmdList.length
  // while(index<=cmdListLength){
  //   runCommand(cmdList[index]).then(()=>{
  //     index++;
  //     runCommand(cmdList[index])
  //   })
  // }
  //   cmdList.forEach((val,index)=>{
  //     runCommand(cmdList[index]).then(()=>{
  //       runCommand(cmdList[index + 1])
  //     })
  //   })
  // runCommand(`mkdir hello1 `).then(() => {
  //   runCommand(`cd hello1 && ../bin/run init -t mateen7861`).then(() => {
  //     runCommand(
  //       `cd hello1 && npx gqlg --schemaFilePath ../test/test-schemas/todo.graphql --destDirPath ./tests/apiTests/graphql/output/`
  //     ).then(() => {
  //       fs.writeFile(
  //         "./hello/tests/apiTests/appsyncCredentials.json",
  //         "",
  //         (err: any) => {
  //           if (err) {
  //             process.exit(1);
  //           }
  //         }
  //       );
  //       runCommand(`cd hello1 && yarn build `).then(() => {
  //         runCommand(`cd hello1 && cdk deploy --ci --require-approval never --colors \
  // // --outputs-file ./tests/apiTests/appsyncCredentials.json`).then(() => {
  //           runCommand("cd hello1 && yarn test --colors");
  //         });
  //       });
  //     });
  //   });
  // });
  // await runCommand(`cd hello1 && ../bin/run init -t mateen7861`);
  // await runCommand(`cd hello1 && npx gqlg --schemaFilePath ../test/test-schemas/todo.graphql --destDirPath ./tests/apiTests/graphql/output/`)
  // fs.writeFile("./hello/tests/apiTests/appsyncCredentials.json","",(err:any)=>{
  //   if(err){
  //     process.exit(1)
  //   }
  // })
  // await runCommand(`cd hello1 && yarn build `);
  // runCommand(`cd hello1 && cdk deploy --ci --require-approval never --colors \
  // --outputs-file ./tests/apiTests/appsyncCredentials.json`);
  // await exec(`cd hello && yarn test --colors`,(err:any)=>{
  //   console.log(err)
  // });
  // await runCommand('cd hello1 && yarn test --colors');
  // await execSync("cd hello && cdk destroy --colors");
  // await execSync("rm -rf hello --colors");
})();

async function runCommand(cmd: string): Promise<void> {
  console.log(cmd);
  return new Promise(function (resolve) {
    exec(cmd,async (err: any, stdout: any, stderr: any) => {
      if(err){
        console.log(stdout);
        console.log(stderr);
        console.log(err)
        // exec(`rm -rf hello1`)
        process.exit(1)
      }
      // the *entire* stdout and stderr (buffered)
      console.log(stdout);
      console.log(stderr);
      resolve();
    });
  });
}

// function runCommand(cmd: string) {
//   return getPromise(cmd);

//   //  exec(cmd, (err:any, stdout:any, stderr:any) => {
//   //   if (err) {
//   //     console.log("test cmd")
//   //     console.log(`stderr: ${stderr}`);
//   //     console.log(`stdout: ${stdout}`);
//   //     // node couldn't execute the command
//   //     return;
//   //   }
//   //   console.log("test cmd")

//   //   // the *entire* stdout and stderr (buffered)
//   //   console.log(`stdout: ${stdout}`);
//   //   console.log(`stderr: ${stderr}`);
//   // })
//   //   return
//   // try {
//   //   console.log(cmd)

//   //  const res =  execSync(cmd);
//   // //  console.log(res.toString())

//   // } catch (error) {
//   //   console.log()
//   //   // console.log(error)
//   //   // execSync("rm -rf hello");
//   //   // process.exit(1)
//   // }
// }
