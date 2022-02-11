import { Command, flags } from "@oclif/command";
import {
  writeJsonSync,
  readJsonSync,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { PanacloudconfigFile } from "../utils/constants";
const prettier = require("prettier");

export default class Config extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "queryName" }];

  static flags = {
    help: flags.help({ char: "h" }),
    // true: flags.boolean({ char: "t" }),
    // false: flags.boolean({ char: "f" }),
    // all: flags.boolean({ char: "a" }),
    mock:flags.string(),
    memory:flags.integer(),
    timeout:flags.integer(),
    customData:flags.string(),
    addStage:flags.string(),
    deleteStage:flags.string()
  };
  async run() {
    const { flags, args } = this.parse(Config);
    const spinner = startSpinner("Updating Panacloud Config");

    if (
      // !flags.false && !flags.true &&!flags.all&&
       !args.queryName  && !flags.mock && !flags.customData && !flags.addStage && !flags.deleteStage) {
      stopSpinner(
        spinner,
        "Please use panacloud config -h to get more info about the command",
        true
      );
      process.exit(1);
    }

    const panacloudConfig: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );
    
    const keys = Object.keys(panacloudConfig.lambdas);
    if (args.queryName) {
      if (!keys.includes(args.queryName)) {
        stopSpinner(spinner, `${args.queryName} not found`, true);
        process.exit(1);
      }
    }
      if(flags.mock){
        if(flags.mock === "true"){
          if (panacloudConfig.lambdas[args.queryName].is_mock) {
            stopSpinner(spinner, `${args.queryName} already set to true`, true);
            process.exit(1);
          } else {
            panacloudConfig.lambdas[args.queryName].is_mock = true;
          }
        }else if(flags.mock === "false"){
          if (!panacloudConfig.lambdas[args.queryName].is_mock) {
            stopSpinner(spinner, `${args.queryName} already set to false`, true);
            process.exit(1);
          } else {
            panacloudConfig.lambdas[args.queryName].is_mock = false;
          }
        }else {
          stopSpinner(
            spinner,
            "panacloud config query_name --mock true | false",
            true
          );
          process.exit(1);
        }
      }
      if(flags.customData){
        console.log(flags.customData);
        if(flags.customData === "true"){
          if (panacloudConfig.mockData!["is_custom"]) {
            stopSpinner(spinner, `${args.queryName} already set to true`, true);
            process.exit(1);
          } else {
            panacloudConfig.mockData!["is_custom"] = true;
          }
        }else if(flags.customData === "false"){
          if (!panacloudConfig.mockData!["is_custom"]) {
            stopSpinner(spinner, `${args.queryName} already set to false`, true);
            process.exit(1);
          } else {
            panacloudConfig.mockData!["is_custom"] = false;
          }
        }else {
          stopSpinner(
            spinner,
            "panacloud config query_name --mock true | false",
            true
          );
          process.exit(1);
        }
      }
      if(flags.memory){
          if(flags.memory <= 0){
            stopSpinner(
              spinner,
              "Invalid Memory Size",
              true
            );
            process.exit(1);
          }else{
            panacloudConfig.lambdas[args.queryName].memory_size = flags.memory
          }
      }
      if(flags.timeout){
        if(flags.timeout <= 0){
          stopSpinner(
            spinner,
            "Invalid Timeout",
            true
          );
          process.exit(1);
        }else{
          panacloudConfig.lambdas[args.queryName].timeout = flags.timeout
        }
    }
    if(flags.addStage){
      if(panacloudConfig.stages.includes(flags.addStage)){
        stopSpinner(
          spinner,
          `${flags.addStage} stage already exists!`,
          true
        );
        process.exit(1);
      }else{
        panacloudConfig.stages=[...panacloudConfig.stages,flags.addStage]
      }
  }
  if(flags.deleteStage){
    if(!panacloudConfig.stages.includes(flags.deleteStage)){
      stopSpinner(
        spinner,
        `${flags.deleteStage} stage does not exist!`,
        true
      );
      process.exit(1);
    }else{
      panacloudConfig.stages=panacloudConfig.stages.filter((stage:string)=>stage!==flags.deleteStage)
    }
}
    // if (flags.all) {
    //   if (flags.true) {
    //     keys.forEach((e) => {
    //       if (panacloudConfig.lambdas[e].is_mock === undefined) {
    //         Object.keys(panacloudConfig.lambdas[e]).forEach(
    //           (v) => (panacloudConfig.lambdas[e][v].is_mock = true)
    //         );
    //       } else {
    //         panacloudConfig.lambdas[e].is_mock = true;
    //       }
    //     });
    //   } else if (flags.false) {
    //     keys.forEach((e) => {
    //       if (panacloudConfig.lambdas[e].is_mock === undefined) {
    //         Object.keys(panacloudConfig.lambdas[e]).forEach(
    //           (v) => (panacloudConfig.lambdas[e][v].is_mock = false)
    //         );
    //       } else {
    //         panacloudConfig.lambdas[e].is_mock = false;
    //       }
    //     });
    //   } else {
    //     stopSpinner(
    //       spinner,
    //       "panacloud config -a -t | --true  -f | --false",
    //       true
    //     );
    //     process.exit(1);
    //   }
    // }

    // if (args.queryName) {
    //   if (!keys.includes(args.queryName)) {
    //     this.log(`${args.queryName} not found`);
    //     stopSpinner(spinner, `${args.queryName} not found`, true);
    //     process.exit(1);
    //   }

    //   if (flags.true) {
    //     if (panacloudConfig.lambdas[args.queryName].is_mock) {
    //       stopSpinner(spinner, `${args.queryName} already set to true`, true);
    //       process.exit(1);
    //     } else {
    //       panacloudConfig.lambdas[args.queryName].is_mock = true;
    //     }
    //   } else if (flags.false) {
    //     if (!panacloudConfig.lambdas[args.queryName].is_mock) {
    //       stopSpinner(spinner, `${args.queryName} already set to false`, true);
    //       process.exit(1);
    //     } else {
    //       panacloudConfig.lambdas[args.queryName].is_mock = false;
    //     }
    //   } else {
    //     stopSpinner(
    //       spinner,
    //       "panacloud config query_name -t | --true  -f | --false",
    //       true
    //     );
    //     process.exit(1);
    //   }
    // }

    writeJsonSync("editable_src/panacloudconfig.json", panacloudConfig);

    // Formating Data
    const data = readFileSync("editable_src/panacloudconfig.json", "utf8");
    const formattedConfigFile = prettier.format(data, {
      parser: "json",
    });
    writeFileSync(
      "editable_src/panacloudconfig.json",
      formattedConfigFile,
      "utf8"
    );

    stopSpinner(spinner, "Updated Panacloud Config", false);
  }
}
