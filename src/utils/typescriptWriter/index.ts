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
  initializer?: ((code: TypeScriptWriter) => void) | string
};

type Element = {
  name: string;
  type: string;
};

export type Property = {
  name: string;
  typeName: string;
  accessModifier: 'public' | 'private' | 'protected';
  isReadonly: boolean;
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
    propsName?:string,
    contents?: any
  ) {
    this.code.openBlock(
      `${classDefinition.export ? "export" : null} class ${
        ` ${classDefinition.name}`
      } ${classDefinition.extends ? `extends ${classDefinition.extends}` : ""}`
    );
    properties?.forEach((property: Property) => {
      this.code.line(
        `${property.accessModifier} ${property.isReadonly? "readonly" : ""} ${property.name}: ${property.typeName};`
      );
    });
    let scope = "Construct"
    if(classDefinition.extends === "Stack")
      scope = "Stack"
    this.code.line(` 
    constructor(scope: ${scope}, id: string, props?: ${propsName}) {
        super(scope, id);
    `);
    contents();
    this.code.line(`}`);
    this.code.closeBlock();
  }

  writeVariableDeclaration(definition: VariableDefinition,kind: "const" | "let") {
    this.code.line(`${kind} ${definition.name}`);
    if (definition.typeName) {
        this.code.line(`: ${definition.typeName}`);
    }
    if (definition.initializer) {
        this.code.line(' = ');
        if (typeof (definition.initializer) === 'string') {
            this.code.line(definition.initializer);
        }
        else
          definition.initializer(this);
    }
    this.code.line(';');
    return this;
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
