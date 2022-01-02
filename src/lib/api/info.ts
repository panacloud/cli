const fse = require("fs-extra");

import { boolean } from "@oclif/command/lib/flags";
import { ApiModel, async_response_mutName } from "../../utils/constants";
import {
  ARCHITECTURE,
  PanacloudconfigFile,
  PanacloudConfiglambdaParams,
} from "../../utils/constants";
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

export const generatePanacloudConfig = async (model: ApiModel) => {
  const {
    api: {
      microServiceFields,
      mutationFields,
      generalFields,
      nestedResolver,
      nestedResolverFieldsAndLambdas,
      asyncFields,
    },
  } = model;
  let configJson: PanacloudconfigFile = {
    lambdas: {},
    mockLambdaLayer: {},
    stages: ["prd", "dev"],
  };
  const microServices = Object.keys(microServiceFields!);

  for (let i = 0; i < microServices.length; i++) {
    for (let j = 0; j < microServiceFields![microServices[i]].length; j++) {
      const key = microServiceFields![microServices[i]][j];
      const microService = microServices[i];
      if (!configJson.lambdas[microService]) {
        configJson.lambdas[microService] = {};
      }
      const lambdas = (configJson.lambdas[microService][key] =
        {} as PanacloudConfiglambdaParams);
      lambdas.asset_path = `mock_lambda/${microService}/${key}/index.ts`;
      lambdas.is_mock = true;

      if (asyncFields && asyncFields.includes(key)) {
        const consumerLambdas = (configJson.lambdas[microService][
          `${key}_consumer`
        ] = {} as PanacloudConfiglambdaParams);
        consumerLambdas.asset_path = `mock_lambda/${microService}/${key}_consumer/index.ts`;
        consumerLambdas.is_mock = true;
      }
    }
  }

  for (let i = 0; i < generalFields!.length; i++) {
    const key = generalFields![i];
    const lambdas = (configJson.lambdas[key] =
      {} as PanacloudConfiglambdaParams);
    lambdas.asset_path = `mock_lambda/${key}/index.ts`;
    lambdas.is_mock = true;
    if (asyncFields && asyncFields.includes(key)) {
      const consumerLambdas = (configJson.lambdas[`${key}_consumer`] =
        {} as PanacloudConfiglambdaParams);
      consumerLambdas.asset_path = `mock_lambda/${key}_consumer/index.ts`;
      consumerLambdas.is_mock = true;
    }
  }

  if (nestedResolver) {
    configJson.nestedLambdas = {};
    const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
    for (let index = 0; index < nestedResolverLambdas.length; index++) {
      const key = nestedResolverLambdas[index];
      const nestedLambda = (configJson.nestedLambdas[key] =
        {} as PanacloudConfiglambdaParams);
      nestedLambda[
        "asset_path"
      ] = `mock_lambda/nestedResolvers/${key}/index.ts`;
      nestedLambda["is_mock"] = true;
    }
  }

  configJson.mockLambdaLayer["asset_path"] = `mock_lambda_layer`;

  await fse.writeJson(`./editable_src/panacloudconfig.json`, configJson);

  await fse.writeJson(
    `./.panacloud/editable_src/panacloudconfig.json`,
    configJson
  );

  return configJson;
};

export const updatePanacloudConfig = async (model: ApiModel, spinner: any) => {
  const {
    api: {
      microServiceFields,
      asyncFields,
      mutationFields,
      generalFields,
      queiresFields,
      nestedResolver,
      nestedResolverFieldsAndLambdas,
    },
  } = model;

  const configPanacloud: PanacloudconfigFile = fse.readJsonSync(
    "editable_src/panacloudconfig.json"
  );
  let panacloudConfigNew = configPanacloud;

  let prevItems = Object.keys(configPanacloud.lambdas);

  const prevMicroServices = prevItems.filter((val: string) =>
    configPanacloud.lambdas[val].asset_path ? false : true
  );
  const prevGeneralLambdas = prevItems.filter((val: string) =>
    configPanacloud.lambdas[val].asset_path ? true : false
  );
  const newMicroServices = Object.keys(microServiceFields!);
  ///Editable_src Lambda Layer
  let oldLambdas: string[] = [];
  for (const ele of prevItems) {
    const microService = newMicroServices.includes(ele);
    if (microService) {
      oldLambdas = [...Object.keys(configPanacloud.lambdas[ele])];
    } else {
      if (!ele.includes("_consumer")) {
        oldLambdas = [...oldLambdas, ele];
      }
    }
  }

  const allQueries = [...mutationFields!, ...queiresFields!];
  let differenceLambdas = allQueries
    .filter((val) => !oldLambdas.includes(val))
    .concat(oldLambdas.filter((val) => !allQueries.includes(val)));

  let lambdaCreate = [];
  for (const element of differenceLambdas) {
    if (!oldLambdas.includes(element)) {
      lambdaCreate.push(element);
    }
  }

  model.api.createMockLambda = lambdaCreate;
  ///Editable_src Lambda Layer

  let differenceMicroServices = newMicroServices
    .filter((val) => !prevMicroServices.includes(val))
    .concat(prevMicroServices.filter((val) => !newMicroServices.includes(val)));

  for (let diff of differenceMicroServices) {
    if (newMicroServices.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams;
    } else {
      delete panacloudConfigNew.lambdas[diff];
    }
  }

  for (let service of newMicroServices) {
    const prevMicroServicesLambdas = Object.keys(
      configPanacloud.lambdas[service]
    );
    let newMicroServicesLambdas = microServiceFields![service];
    let prevMicroServicesMutLambdas: string[] = [];

    // for (let serv of newMicroServicesLambdas) {
    //   const isMutation = mutationFields?.includes(serv);
    //   if (isMutation && architecture === ARCHITECTURE.eventDriven) {
    //     newMicroServicesLambdas = [...newMicroServicesLambdas,`${serv}_consumer` ]
    //   }
    // }
    if (asyncFields) {
      // for (let serv of newMicroServicesLambdas) {
      //   const isMutation = mutationFields?.includes(serv);
      //   if (isMutation ) {
      //     //newMicroServicesLambdas.push(`${serv}_consumer`)
      //     newMicroServicesLambdas = [...newMicroServicesLambdas,`${serv}_consumer` ]
      //   }
      // }

      prevMicroServicesMutLambdas = prevMicroServicesLambdas.filter(
        (val: string) => val.split("_").pop() !== "consumer"
      );
    }

    let differenceMicroServicesLambdas = newMicroServicesLambdas
      .filter((val) => !prevMicroServicesMutLambdas.includes(val))
      .concat(
        prevMicroServicesMutLambdas.filter(
          (val) => !newMicroServicesLambdas.includes(val)
        )
      );

    for (let diff of differenceMicroServicesLambdas) {
      if (newMicroServicesLambdas.includes(diff)) {
        panacloudConfigNew.lambdas[service][diff] =
          {} as PanacloudConfiglambdaParams;
        panacloudConfigNew.lambdas[service][
          diff
        ].asset_path = `mock_lambda/${service}/${diff}/index.ts`;
        panacloudConfigNew.lambdas[service][diff].is_mock = true;
      } else {
        delete panacloudConfigNew.lambdas[service][diff];
        delete panacloudConfigNew.lambdas[service][`${diff}_consumer`];
      }
    }

    for (let mutLambda of Object.keys(panacloudConfigNew.lambdas[service])) {
      //const isMutation = mutationFields?.includes(mutLambda);

      //if (isMutation && !panacloudConfigNew.lambdas[service][`${mutLambda}_consumer`]){

      if (asyncFields?.includes(mutLambda)) {
        if(!Object.keys(panacloudConfigNew.lambdas[service]).includes(`${mutLambda}_consumer`)){
          panacloudConfigNew.lambdas[service][`${mutLambda}_consumer`] =
          {} as PanacloudConfiglambdaParams;
          panacloudConfigNew.lambdas[service][
            `${mutLambda}_consumer`
          ].asset_path = `mock_lambda/${service}/${mutLambda}_consumer/index.ts`;
          panacloudConfigNew.lambdas[service][`${mutLambda}_consumer`].is_mock =
            true;
        }
      } else {
        delete panacloudConfigNew.lambdas[service][`${mutLambda}_consumer`];
      }
    }
  }

  let prevGeneralMutLambdas: string[] = [];

  if (asyncFields) {
    // for (let serv of newMicroServicesLambdas) {
    //   const isMutation = mutationFields?.includes(serv);
    //   if (isMutation ) {
    //     //newMicroServicesLambdas.push(`${serv}_consumer`)
    //     newMicroServicesLambdas = [...newMicroServicesLambdas,`${serv}_consumer` ]
    //   }
    // }

    prevGeneralMutLambdas = prevGeneralLambdas.filter(
      (val: string) => val.split("_").pop() !== "consumer"
    );
    prevGeneralMutLambdas = prevGeneralMutLambdas.filter(
      (val: string) => val !== async_response_mutName
    );
  }

  let difference = generalFields!
    .filter((val) => !prevGeneralMutLambdas.includes(val))
    .concat(
      prevGeneralMutLambdas.filter((val) => !generalFields?.includes(val))
    );

  difference = difference.filter(
    (val: string) => val !== async_response_mutName
  );

  for (let diff of difference) {
    if (generalFields!.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams;
      panacloudConfigNew.lambdas[
        diff
      ].asset_path = `mock_lambda/${diff}/index.ts`;
      panacloudConfigNew.lambdas[diff].is_mock = true;
      if (asyncFields && asyncFields.includes(diff)) {
        panacloudConfigNew.lambdas[`${diff}_consumer`] =
          {} as PanacloudConfiglambdaParams;
        panacloudConfigNew.lambdas[
          `${diff}_consumer`
        ].asset_path = `mock_lambda/${diff}_consumer/index.ts`;
        panacloudConfigNew.lambdas[`${diff}_consumer`].is_mock = true;
      }
    } else {
      delete panacloudConfigNew.lambdas[diff];
      delete panacloudConfigNew.lambdas[`${diff}_consumer`];
    }
  }

  let newItems = Object.keys(panacloudConfigNew.lambdas);

  const newGeneralMutLambdas = newItems.filter((val: string) =>
    panacloudConfigNew.lambdas[val].asset_path ? true : false
  );

  for (let mutLambda of newGeneralMutLambdas) {
    const isMutation = mutationFields?.includes(mutLambda);

    if (
      /*(isMutation && !panacloudConfigNew.lambdas[`${mutLambda}_consumer`]) &&*/ asyncFields?.includes(
        mutLambda
      )
    ) {
      panacloudConfigNew.lambdas[`${mutLambda}_consumer`] =
        {} as PanacloudConfiglambdaParams;
      panacloudConfigNew.lambdas[
        `${mutLambda}_consumer`
      ].asset_path = `mock_lambda/${mutLambda}_consumer/index.ts`;
      panacloudConfigNew.lambdas[`${mutLambda}_consumer`].is_mock = true;
    } else {
      delete panacloudConfigNew.lambdas[`${mutLambda}_consumer`];
    }
  }

  if (nestedResolver) {
    panacloudConfigNew.nestedLambdas = {};
    const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
    for (let index = 0; index < nestedResolverLambdas.length; index++) {
      const key = nestedResolverLambdas[index];
      const nestedLambda = (panacloudConfigNew.nestedLambdas[key] =
        {} as PanacloudConfiglambdaParams);
      nestedLambda[
        "asset_path"
      ] = `mock_lambda/nestedResolvers/${key}/index.ts`;
      nestedLambda["is_mock"] = true;
    }
  } else {
    panacloudConfigNew.nestedLambdas && delete panacloudConfigNew.nestedLambdas;
  }

  if (configPanacloud.mockLambdaLayer["asset_path"])
    panacloudConfigNew.mockLambdaLayer["asset_path"] =
      configPanacloud.mockLambdaLayer["asset_path"];
  else panacloudConfigNew.mockLambdaLayer["asset_path"] = "mock_lambda_layer";

  fse.removeSync("editable_src/panacloudconfig.json");
  fse.writeJson(
    `./editable_src/panacloudconfig.json`,
    panacloudConfigNew,
    (err: string) => {
      if (err) {
        stopSpinner(spinner, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  return panacloudConfigNew;
};