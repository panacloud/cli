import { startSpinner, stopSpinner } from "../../../spinner";

import { contextInfo, generatePanacloudConfig, updatePanacloudConfig } from "../../info";
import {
    Config,
    APITYPE,
    ApiModel,
    LAMBDASTYLE,
} from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";

const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");


async function updateYourOwnApi(config: Config, spinner:any) {

    const workingDir = _.snakeCase(path.basename(process.cwd()));

    const model: ApiModel = {
        api: {
            ...config.api,
        },
        workingDir: workingDir,
    };

    let schema = fs.readFileSync("custom_src/graphql/schema/schema.graphql", "utf8", (err: string) => {
        if (err) {
            stopSpinner(spinner, `Error: ${err}`, true);
            process.exit(1);
        }
    });


    const gqlSchema = buildSchema(`${schema}`);

    // Model Config
    const queriesFields: any = gqlSchema.getQueryType()?.getFields();
    const mutationsFields: any = gqlSchema.getMutationType()?.getFields();
    model.api.schema = introspectionFromSchema(gqlSchema);
    model.api.queiresFields = [...Object.keys(queriesFields)];
    model.api.mutationFields = [...Object.keys(mutationsFields)];

    await updatePanacloudConfig(
        model.api.queiresFields,
        model.api.mutationFields,
        spinner
    );


    // Codegenerator Function
    await generator(model);

}

export default updateYourOwnApi;
