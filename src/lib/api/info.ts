const fse = require("fs-extra");

import { PanacloudconfigFile, PanacloudConfiglambdaParams } from "../../utils/constants";
import { stopSpinner } from "../spinner";

export const contextInfo = (apiToken: string, entityId: string) => {
  return {
    api_token: apiToken,
    entityId: entityId,
    verifySubscriptionTokenApiUrl:
      "https://vj5t42ne26.execute-api.us-east-1.amazonaws.com/prod/subscriptionToken",
    verifyApiTokenApiUrl:
      "https://vj5t42ne26.execute-api.us-east-1.amazonaws.com/prod/apiToken",
  };
};



export const generatePanacloudConfig = async (
  generalFields: string[],
  microServiceFields: {
    [k: string]: any[];
  }
) => {

  let configJson: PanacloudconfigFile = { lambdas: {} };


  const microServices = Object.keys(microServiceFields);

  for (let i = 0; i < microServices.length; i++) {
    for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {

      const key = microServiceFields[microServices[i]][j];
      const microService = microServices[i];

      if (!configJson.lambdas[microService]) {
        configJson.lambdas[microService] = {}
      }
      const lambdas = configJson.lambdas[microService][key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `lambda/${microService}/${key}/index.ts`;
    }

  }




  for (let i = 0; i < generalFields.length; i++) {

    const key = generalFields[i];

    const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
    lambdas.asset_path = `lambda/${key}/index.ts`;

  }


  await fse.writeJson(`./custom_src/panacloudconfig.json`, configJson);

  return configJson;
};

export const updatePanacloudConfig = async (
  generalFields: string[],
  microServiceFields: {
    [k: string]: any[];
  },
  spinner: any
) => {

  const configPanacloud: PanacloudconfigFile = fse.readJsonSync('custom_src/panacloudconfig.json')
  let panacloudConfigNew = configPanacloud;

  let prevItems = Object.keys(configPanacloud.lambdas)

  const prevMicroServices = prevItems.filter((val: any) => configPanacloud.lambdas[val].asset_path ? false : true)

  const prevGeneralLambdas = prevItems.filter((val: any) => configPanacloud.lambdas[val].asset_path ? true : false)

  const newMicroServices = Object.keys(microServiceFields);



  let differenceMicroServices = newMicroServices
    .filter(val => !prevMicroServices.includes(val))
    .concat(prevMicroServices.filter(val => !newMicroServices.includes(val)));


  for (let diff of differenceMicroServices) {

    if (newMicroServices.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
      panacloudConfigNew.lambdas[diff] = {}
    }
    else {
      delete panacloudConfigNew.lambdas[diff];

    }
  }


  for (let service of newMicroServices) {

    const prevMicroServicesLambdas = Object.keys(configPanacloud.lambdas[service])

    let differenceMicroServicesLambdas = microServiceFields[service]
      .filter(val => !prevMicroServicesLambdas.includes(val))
      .concat(prevMicroServicesLambdas.filter(val => !microServiceFields[service].includes(val)));



    for (let diff of differenceMicroServicesLambdas) {

      if (microServiceFields[service].includes(diff)) {
        panacloudConfigNew.lambdas[service][diff] = {} as PanacloudConfiglambdaParams
        panacloudConfigNew.lambdas[service][diff].asset_path = `lambda/${service}/${diff}/index.ts`
      }
      else {
        delete panacloudConfigNew.lambdas[service][diff];

      }
    }

  }




  let difference = generalFields
    .filter(val => !prevGeneralLambdas.includes(val))
    .concat(prevGeneralLambdas.filter(val => !generalFields.includes(val)));

  for (let diff of difference) {

    if (generalFields.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
      panacloudConfigNew.lambdas[diff].asset_path = `lambda/${diff}/index.ts`

    }
    else {
      delete panacloudConfigNew.lambdas[diff];

    }
  }

  fse.removeSync('custom_src/panacloudconfig.json')
  fse.writeJson(`./custom_src/panacloudconfig.json`, panacloudConfigNew, (err: string) => {
    if (err) {
      stopSpinner(spinner, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  return panacloudConfigNew;


};
