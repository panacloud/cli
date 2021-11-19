import {Command, flags} from '@oclif/command'
import chalk = require('chalk')
import * as validUrl from "valid-url";
import { readFileSync } from 'fs-extra'
const fs = require("fs")
export default class Status extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(Status)

   this.checkIsDeployed()
   this.checkIsFileChange()
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
  checkIsDeployed() {
    let API_URL;
    let API_KEY;
    let data= JSON.parse(readFileSync("./cdk-outputs.json").toString())
    const apiName = JSON.parse(readFileSync("./codegenconfig.json").toString()).api.apiName
    const values:string[] =Object.values(
      Object.entries(data)[0][1] as any
    );
    if(values.length === 0){
      this.log(chalk.red(`${apiName} is currently not deployed,give the command panacloud deploy to deploy it.`))
      return 
    }else{
      values.forEach((val: string) => {
        if (validUrl.isUri(val)) {
          API_URL = val;
        } else {
          API_KEY = val;
        }
      });
      this.log(chalk.blue(`${apiName} is Deployed!`))
      this.log(chalk.blue(`API URL : ${API_URL}`))
      this.log(chalk.blue(`API Key : ${API_KEY}`))

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
