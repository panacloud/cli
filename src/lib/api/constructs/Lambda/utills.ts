import lodash = require("lodash");

export function transformStr(str:string):string {
    let result = "";
    if(str.includes("Mutation")&&str.includes("Args")){
      let replaced = str.replace("Mutation", "").replace("Args", "");
      result = `Mutation${replaced.charAt(0).toUpperCase()}${lodash.camelCase(
        replaced.slice(1)
      )}Args`
    }
    else if (str.includes("Mutation")) {
      let replaced = str.replace("Mutation", "");
      result = `Mutation${replaced.charAt(0).toUpperCase()}${lodash.camelCase(
        replaced.slice(1)
      )}`;
    } else if (str.includes("Args")) {
      let replaced = str.replace("Args", "");
      result =   `${replaced.charAt(0).toUpperCase()}${lodash.camelCase(replaced.slice(1))}Args`
    }else{
        result = `${str.charAt(0).toUpperCase()}${lodash.camelCase(str.slice(1))}`
    }
    
    return result
  }