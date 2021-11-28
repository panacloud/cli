import { CodeMaker } from "codemaker";
import { Property } from "../../../../../utils/typescriptWriter";

export const auroradbPropertiesInitializer = (
  apiName: string,
  code: CodeMaker
) => {
  code.line(`this.serviceRole = ${apiName}Lambda_serviceRole;`);
  code.line(`this.vpcRef = ${apiName}_vpc;`);
  code.line(`this.SECRET_ARN = ${apiName}_secret`);
  code.line(`this.CLUSTER_ARN = ${apiName}_db.clusterArn`);
  code.line(`this.DB_NAME =  props?.prod ? props?.prod+"_${apiName}DB" : "${apiName}DB"`);
  code.line(`this.db_cluster = ${apiName}_db`)
};

export const auroradbPropertiesHandler = (): Property[] => {
  return [
    {
      name: "CLUSTER_ARN",
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "SECRET_ARN",
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "DB_NAME",
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "vpcRef",
      typeName: "ec2.Vpc",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "serviceRole",
      typeName: "iam.Role",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "db_cluster",
      typeName: "rds.ServerlessCluster",
      accessModifier: "public",
      isReadonly: false,
    },
    
  ];
};
