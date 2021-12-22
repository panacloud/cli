import {Command, flags} from '@oclif/command'
import chalk = require('chalk')
import * as validUrl from "valid-url";
import { readFileSync } from 'fs-extra'
import { PanacloudconfigFile } from '../utils/constants';
import { existsSync } from 'fs';
import inquirer = require('inquirer');
const fs = require("fs")
export default class Status extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(Status)
    const {stages} = JSON.parse(
      readFileSync("./editable_src/panacloudconfig.json").toString()
    )
    const {stage} =  await inquirer.prompt([
      {
        type: "list",
        name: "stage",
        message: "Select Stage",
        choices: [...stages],
        default: stages[0],
        validate: Boolean,
      },
    ])
   this.checkIsDeployed(stage)
   this.checkIsFileChange()
   this.checkIsRealLambda()
  }
  checkIsRealLambda() {
    const config:PanacloudconfigFile = JSON.parse(readFileSync("./editable_src/panacloudconfig.json").toString())
    const allLambdas = []
    const mockLambdas = []
    const realLambdas = []
   config.nestedLambdas? allLambdas.push(...Object.keys(config.lambdas),...Object.keys(config.nestedLambdas)):allLambdas.push(...Object.keys(config.lambdas))
    for(let key of allLambdas){
      if(config.lambdas[key].is_mock ===true){
        mockLambdas.push(key)
      }else{
        realLambdas.push(key)
      }
    }
    this.log("\n")

    if(mockLambdas.length > 0){
      this.log(chalk.white(`Following APIs are using mock data:`))
      for(let i of mockLambdas){
        this.log(chalk.white(i))
      }
      this.log("\n")
    }
    if(realLambdas.length > 0){
      this.log(chalk.white(`Following APIs have real implementations:`))
      for(let i of realLambdas){
        this.log(chalk.white(i))
      }
    }
  }
  checkIsFileChange(){
    let [schemaChanged, panacloudConfigChanged] = this.isChanged();
    if(schemaChanged) {
      this.log(
        chalk.red(
          "GraphQL Schema has been updated after the last generation command please run the panacloud update command to update the code."
        )
      );
    }
    else {
      this.log(
        chalk.greenBright(
          "GraphQL Schema is unchanged."
        )
      );
    }

    if(panacloudConfigChanged) {
      this.log(
        chalk.red(
          "Panacloud Config has been updated after the last generation command please run the panacloud update command to update the code."
        )
      );
    }
    else {
      this.log(
        chalk.greenBright(
          "Panacloud Config is unchanged."
        )
      );
    }
  }
  checkIsDeployed(stage:string) {
    let API_URL;
    let API_KEY;
    const apiName = JSON.parse(readFileSync("./codegenconfig.json").toString()).api.apiName
    if (!existsSync(`./cdk-${stage}-outputs.json`)) {
      this.log(chalk.red(`${apiName}'s ${stage} stage is currently not deployed, give the command npm run deploy-${stage} to deploy it.`))
    }else{
      let data= JSON.parse(readFileSync(`./cdk-${stage}-outputs.json`).toString())
    const values:string[] =Object.values(
      Object.entries(data)[0][1] as any
    );
    if(values.length === 0){
      this.log(chalk.red(`${apiName}'s ${stage} stage is currently not deployed, give the command npm run deploy-${stage} to deploy it.`))
      return 
    }else{
      values.forEach((val: string) => {
        if (validUrl.isUri(val)) {
          API_URL = val;
        } else {
          API_KEY = val;
        }
      });
      this.log(chalk.blue(`${apiName}'s ${stage} stage is Deployed!`))
      this.log(chalk.blue(`API URL : ${API_URL}`))
      this.log(chalk.blue(`API Key : ${API_KEY}`))

    }
    }    
    
   
    
   
  }
  isChanged(): [boolean, boolean]{
    
    let schemaChanged: boolean = this.isFileChanged("editable_src/graphql/schema/schema.graphql", 
    ".panacloud/editable_src/graphql/schema/schema.graphql");
    
    let panacloudConfigChanged: boolean = this.isFileChanged("editable_src/panacloudconfig.json",
    ".panacloud/editable_src/panacloudconfig.json");
    return [schemaChanged, panacloudConfigChanged]; 
   
  }

  isFileChanged(file1: string, file2: string): boolean {
    let result: boolean = false;

    const file1Data = (fs.readFileSync(file1)).toString().replace(/(\r\n|\n|\r)/gm, '').replace(/\s/g, '')
    const file2Data = (fs.readFileSync(file2)).toString().replace(/(\r\n|\n|\r)/gm, '').replace(/\s/g, '')
    if(file1Data === file2Data){
      result = false
    }else{
      result = true
    }
    return result
  
  }
}
