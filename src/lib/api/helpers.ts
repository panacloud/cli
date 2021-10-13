export const ScalarAndEnumKindFinder = (type: any): boolean | any => {
    switch (type.kind) {
      case "SCALAR":
        return false;
      case "ENUM":
        return false;
      case "INPUT_OBJECT":
        return false;
      default:
        return true;
    }
};


export const EliminateScalarTypes = (type: any): boolean | any => {
    switch (type.name) {
      case "Mutation":
        return false;
      case "Query":
        return false;
      case "Subscription":
        return false;
      case "AWSDate":
        return false;
      case "AWSTime":
        return false;
      case "AWSDateTime":
        return false;
      case "AWSTimestamp":
        return false;
      case "AWSJSON":
        return false;
      case "AWSURL":
        return false;
      case "AWSPhone":
        return false;
      case "AWSIPAddress":
        return false;
      case "BigInt":
        return false;
      case "Double":
        return false;
      case "AWSEmail":
        return false;
      case "__Schema":
        return false;
      case "__Type":
        return false;
      case "__Field":
        return false;
      case "__InputValue":
        return false;
      case "__EnumValue":
        return false;
      case "String":
        return false;
      case "Int":
        return false;
      case "ID":
        return false;
      case "__Directive":
        return false;
      default:
        return true;
    }
  };
  
       