const fse = require("fs-extra");

import { ApiModel } from "../../utils/constants";
import { ARCHITECTURE, PanacloudconfigFile, PanacloudConfiglambdaParams } from "../../utils/constants";
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
 model:ApiModel
) => {
  const {api: { microServiceFields, architecture,mutationFields,generalFields,nestedResolver,nestedResolverFieldsAndLambdas }} = model;
  let configJson: PanacloudconfigFile = { lambdas: {} };
  const microServices = Object.keys(microServiceFields!);

  for (let i = 0; i < microServices.length; i++) {
    for (let j = 0; j < microServiceFields![microServices[i]].length; j++) {
      const key = microServiceFields![microServices[i]][j];
      const microService = microServices[i];
      const isMutation = mutationFields?.includes(key);
      if (!configJson.lambdas[microService]) {
        configJson.lambdas[microService] = {}
      }
      const lambdas = configJson.lambdas[microService][key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `lambda/${microService}/${key}/index.ts`;
      if (architecture === ARCHITECTURE.eventDriven && isMutation) {
        const consumerLambdas = configJson.lambdas[microService][`${key}_consumer`] = {} as PanacloudConfiglambdaParams
        consumerLambdas.asset_path = `mock_lambda/${microService}/${key}_consumer/index.ts`;
      }
    }
  }

  for (let i = 0; i < generalFields!.length; i++) {
    const key = generalFields![i];
    const isMutation = mutationFields?.includes(key);
    const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
    lambdas.asset_path = `mock_lambda/${key}/index.ts`;
    if (architecture === ARCHITECTURE.eventDriven && isMutation) {
      const consumerLambdas = configJson.lambdas[`${key}_consumer`] = {} as PanacloudConfiglambdaParams
      consumerLambdas.asset_path = `mock_lambda/${key}_consumer/index.ts`;
    }
  }
  
  if(nestedResolver){
    nestedResolverFieldsAndLambdas?.nestedResolverLambdas!.forEach((key: string) => {
      const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `mock_lambda/resolvers/${key}/index.ts`;
    });
  }

  await fse.writeJson(`./editable_src/panacloudconfig.json`, configJson);

  return configJson;
};

export const updatePanacloudConfig = async (
model:ApiModel, spinner:any
) => {

  const {
    api: { microServiceFields, architecture,mutationFields,generalFields, nestedResolver,nestedResolverFieldsAndLambdas },
  } = model;


  const configPanacloud: PanacloudconfigFile = fse.readJsonSync('editable_src/panacloudconfig.json')
  let panacloudConfigNew = configPanacloud;

  let prevItems = Object.keys(configPanacloud.lambdas)

  const prevMicroServices = prevItems.filter((val: any) => configPanacloud.lambdas[val].asset_path ? false : true)

  const prevGeneralLambdas = prevItems.filter((val: any) => configPanacloud.lambdas[val].asset_path ? true : false)

  const newMicroServices = Object.keys(microServiceFields!);



  let differenceMicroServices = newMicroServices
    .filter(val => !prevMicroServices.includes(val))
    .concat(prevMicroServices.filter(val => !newMicroServices.includes(val)));


  for (let diff of differenceMicroServices) {

    if (newMicroServices.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
    }
    else {
      delete panacloudConfigNew.lambdas[diff];

    }
  }




  for (let service of newMicroServices) {

    const prevMicroServicesLambdas = Object.keys(configPanacloud.lambdas[service])
    let newMicroServicesLambdas = microServiceFields![service];

 

    for (let serv of newMicroServicesLambdas) {
      const isMutation = mutationFields?.includes(serv);
      if (isMutation ) {
        //newMicroServicesLambdas.push(`${serv}_consumer`)
        newMicroServicesLambdas = [...newMicroServicesLambdas,`${serv}_consumer` ]
      }
    }




    let differenceMicroServicesLambdas = newMicroServicesLambdas
      .filter(val => !prevMicroServicesLambdas.includes(val))
      .concat(prevMicroServicesLambdas.filter(val => !newMicroServicesLambdas.includes(val)));



    for (let diff of differenceMicroServicesLambdas) {


      if (microServiceFields![service].includes(diff)) {
        panacloudConfigNew.lambdas[service][diff] = {} as PanacloudConfiglambdaParams
        panacloudConfigNew.lambdas[service][diff].asset_path = `mock_lambda/${service}/${diff}/index.ts`

        const isMutation = mutationFields?.includes(diff);


        if (architecture === ARCHITECTURE.eventDriven && isMutation) {

          panacloudConfigNew.lambdas[service][`${diff}_consumer`] = {} as PanacloudConfiglambdaParams
          panacloudConfigNew.lambdas[service][`${diff}_consumer`].asset_path = `mock_lambda/${service}/${diff}_consumer/index.ts`
        }
      }
      else {
        delete panacloudConfigNew.lambdas[service][diff];

      }



    }

  }




  let difference = generalFields!
    .filter(val => !prevGeneralLambdas.includes(val))
    .concat(prevGeneralLambdas.filter(val => !generalFields?.includes(val)));

  for (let diff of difference) {

    const isMutation = mutationFields?.includes(diff);


    if (generalFields!.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
      panacloudConfigNew.lambdas[diff].asset_path = `mock_lambda/${diff}/index.ts`



      if (architecture === ARCHITECTURE.eventDriven && isMutation) {

        panacloudConfigNew.lambdas[`${diff}_consumer`] = {} as PanacloudConfiglambdaParams
        panacloudConfigNew.lambdas[`${diff}_consumer`].asset_path = `mock_lambda/${diff}_consumer/index.ts`
      }

    }
    else {
      delete panacloudConfigNew.lambdas[diff];
    }
  }

  if(nestedResolver){
    nestedResolverFieldsAndLambdas?.nestedResolverLambdas!.forEach((key: string) => {
      const lambdas = panacloudConfigNew.lambdas[key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `mock_lambda/nestedResolvers/${key}/index.ts`;
    });
  }


  fse.removeSync('editable_src/panacloudconfig.json')
  fse.writeJson(`./editable_src/panacloudconfig.json`, panacloudConfigNew, (err: string) => {
    if (err) {
      stopSpinner(spinner, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  return panacloudConfigNew;


};
