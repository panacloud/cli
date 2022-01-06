import lodash = require("lodash");
import { transformStr } from "../../constructs/Lambda/utills";
export function transformArgumentType(str: string): string {
  return str
    .split("_")
    .reduce((out_str: string, val: string, index: number, arr: string[]) => {
      return (out_str += `${transformStr(val)}${
        arr.length > index + 1 ? "_" : ""
      }`);
    }, "");
}
export function transformResponseType(str: string): string {
  return str
    .split("_")
    .reduce((out_str: string, val: string, index: number, arr: string[]) => {
      if (val.includes("|")) {
        let commaStr = val
          .split("|")
          .reduce((outStr, val, index: number, arr: string[]) => {
            val = val.replace(" ", "");

            return (outStr += `${val.charAt(0).toUpperCase()}${lodash.camelCase(
              val.slice(1)
            )}${arr.length > index + 1 ? "|" : ""}`);
          }, "");
        return (out_str += commaStr);
      }
      if (val.includes("[]")) {
        let bracketStr = val
          .split("[]")
          .reduce((outStr, val, index: number, arr: string[]) => {
            val = val.replace(" ", "");

            return (outStr += `${val.charAt(0).toUpperCase()}${lodash.camelCase(
              val.slice(1)
            )}${arr.length > index + 1 ? "[]" : ""}`);
          }, "");
        return (out_str += bracketStr);
      }
      return (out_str += `${val.charAt(0).toUpperCase()}${lodash.camelCase(
        val.slice(1)
      )}${arr.length > index + 1 ? "_" : ""}`);
    }, "");
}
