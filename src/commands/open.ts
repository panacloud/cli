import {Command, flags} from '@oclif/command'
import chalk = require('chalk');
import { existsSync, readFileSync } from 'fs-extra';
import { startSpinner, stopSpinner } from '../lib/spinner'
import * as validUrl from "valid-url";
const express = require("express");
const open = require("open");
export default class Open extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]
  async run(){
    let API_URL;
    let API_KEY;
    const apiName = JSON.parse(readFileSync("./codegenconfig.json").toString()).api.apiName
    if (!existsSync("./cdk-outputs.json")) {
      this.log(chalk.red(`${apiName} is currently not deployed, give the command panacloud deploy to deploy it.`))
    }else{
      let data= JSON.parse(readFileSync("./cdk-outputs.json").toString())
    const values:string[] =Object.values(
      Object.entries(data)[0][1] as any
    );
    if(values.length === 0){
      this.log(chalk.red(`${apiName} is currently not deployed, give the command panacloud deploy to deploy it.`))
      return 
    }else{
      values.forEach((val: string) => {
        if (validUrl.isUri(val)) {
          API_URL = val;
        } else {
          API_KEY = val;
        }
      });
      API_URL && API_KEY && this.runGraphqlClient(API_URL,API_KEY)

    }
    }    
    
   
    
  }

  async runGraphqlClient(api_url:string,api_key:string) {
    const graphqlSpinner = startSpinner(
      "Starting Grphql Client"
    );

    // Check if user is logged in or not
   

    const app = express();
    const port = 8080;


    app.use(express.json());

    app.use((req: any, res: any, next: any) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

    const ExpressServer = async () => {
      const server = await app.listen(port);
      let count = 0
      app.get('/appsync/credentials', function(req:any, res:any){
        res.json({
            api_url:api_url,
            api_key:api_key
        })
        if(count === 0){
          graphqlSpinner.stopAndPersist({
            text:"Graphql Client is Running 🚀"
          })
        }
        count++
    });
    };

    await ExpressServer();

    await open(`https://appsync-graphql-client.netlify.app/`);
  }
}
