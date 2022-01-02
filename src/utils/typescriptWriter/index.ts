import { CodeMaker } from "codemaker";

export type ClassDefinition = {
  name: string;
  export: boolean;
  extends?: string;
  description?: string[];
  implements?: string;
};

export type classMethodDefinition = {
  name: string;
  static: boolean;
  visibility: "public" | "private";
  outputType: string;
  props?:string;
  content?:()=>void;
};

type VariableDefinition = {
  name: string;
  typeName: string;
  initializer?: ((code: TypeScriptWriter) => void) | string
  export?:boolean
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

  public writeAllImports(lib: string, components: string, ) {
    this.code.line(`import ${components} from "${lib}";`);
  }

  public writeClassBlock(
    classDefinition: ClassDefinition,
    properties?: Property[],
    propsName?:string,
    contents?: ()=>void,
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
    this.code.line(` 
    constructor(scope: Construct, id: string, props?: ${propsName}) {
        super(scope, id);
    `);
    contents&&contents();
    this.code.line(`}`);
    this.code.closeBlock();
  }

  writeVariableDeclaration(definition: VariableDefinition,kind: "const" | "let") {
    this.code.line(`${definition.export? "export ":""} ${kind} ${definition.name}`);
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


  public writeBasicClassBlock(
    classDefinition: ClassDefinition,
    properties?: Property[],
    props?:string,
    constructorContent?: ()=> void,
    functions?:classMethodDefinition[]
  ) {
    this.code.openBlock(
      `${classDefinition.export ? "export" : ""} class ${
        ` ${classDefinition.name}`
      } ${classDefinition.extends ? `extends ${classDefinition.extends}` : ""}
      ${classDefinition.implements? `implements ${classDefinition.implements}`: ""}`
    
    );
    properties?.forEach((property: Property) => {
      this.code.line(
        `${property.accessModifier} ${property.isReadonly? "readonly" : ""} ${property.name}: ${property.typeName};`
      );
    });


    this.code.line(` 
    constructor(${props? props : ""}) {
    `);
    constructorContent && constructorContent();
    this.code.line(`}`);

    functions?.forEach((fun)=>{
 
      this.code.openBlock(`${fun.visibility} ${fun.name} (${fun.props}): ${fun.outputType}`)
      fun.content&&fun.content()
      this.code.closeBlock();
})

this.code.closeBlock();

  }


}
