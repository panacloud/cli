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
  content?:any;
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
 
  public writeApiTests(key:string){
    this.code.line(`describe ("run ${key}", ()=>{`)
    this.code.line()
    this.code.line(`it("${key} works correctly", (done) => {`)
    this.code.line(`
    request
    .post("/graphql")
    .set("x-api-key",API_KEY)
    .send({ query: ${key} ,variables:args})
    .end((err: any, res: any) => {
      expect(err).not.to.be.null;
     expect(res.status).to.equal(200);
     expect(res.body.data[${key}]).to.equal(response);
      done();
    });
    `)
    this.code.line('});')

    this.code.line('});')

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
    contents?: any,
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
    contents();
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
    constructorContent?: any,
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
    constructorContent();
    this.code.line(`}`);

    functions?.forEach((fun)=>{
 
      this.code.openBlock(`${fun.visibility} ${fun.name} (${fun.props}): ${fun.outputType}`)
      fun.content()
      this.code.closeBlock();
})

this.code.closeBlock();

  }


}
