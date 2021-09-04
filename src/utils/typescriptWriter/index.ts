import { CodeMaker } from "codemaker";

export type ClassDefinition = {
  name: string;
  export: boolean;
  extends?: string;
  description?: string[];
};

type VariableDefinition = {
  name: string;
  typeName: string;
  initializer: () => void;
};

type Element = {
  name: string;
  type: string;
};

export type Property = {
  name: string;
  typeName: string;
  accessModifier: string;
  description?: string[];
};

export class TypeScriptWriter {
  public code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }

  public writeImports(lib: string, components: string[], ) {
    this.code.line(`import { ${components.join(", ")} } from "${lib}";`);
  }

  public writeClassBlock(
    classDefinition: ClassDefinition,
    properties?: Property[],
    contents?: any
  ) {
    this.code.openBlock(
      `${classDefinition.export ? "export" : null} class ${this.code.toCamelCase(
        classDefinition.name
      )} ${classDefinition.extends ? `extends ${classDefinition.extends}` : ""}`
    );
    properties?.forEach((property: Property) => {
      this.code.line(
        `${property.accessModifier} ${property.name}: ${property.typeName};`
      );
    });
    contents();
    this.code.closeBlock();
  }

  public writeVariableDeclaration(
    definition: VariableDefinition,
    kind: "const" | "let",
    
  ) {
    this.code.line(
      `${kind} ${definition.name}: ${
        definition.typeName
      } = ${definition.initializer()}`
    );
  }

  public writeInterfaceBlock(
    interfaceName: string,
    elements: Element[],
  ) {
    this.code.openBlock(`interface ${interfaceName}`);
    elements.forEach(({ name, type }) => {
      this.code.line(`${name}: ${type}`);
    });
    this.code.closeBlock();
  }
}
