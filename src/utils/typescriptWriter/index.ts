import { CodeMaker } from "codemaker";

type ClassDefinition = {
  name: string;
  export: boolean;
  extends?: string;
  description?: string[];
};

type VariableDefinition = {
    name: string;
    typeName: string,
    initializer: () => string
}

type Element = {
    name: string;
    type: string;
}

export type Property = {
    name: string;
    typeName: string;
    accessModifier: string;
    description?: string[];
}

export class TypeScriptWriter {
  public writeImports(lib: string, components: string[], code: CodeMaker) {
    code.line(`import { ${components.join(", ")} } from "${lib}";`);
  }

  public writeClassBlock(classDefinition: ClassDefinition, code: CodeMaker, properties?: Property[], contents?: any) {
      code.openBlock(`${classDefinition.export? 'export' : null} class ${code.toCamelCase(classDefinition.name)} ${classDefinition.extends? `extends ${classDefinition.extends}` : ""}`)
      properties?.forEach((property: Property) => {
        code.line(`${property.accessModifier} ${property.name}: ${property.typeName};`)
      })
      contents();
      code.closeBlock();
  }

  public writeVariableDeclaration(definition: VariableDefinition, kind: 'const' | 'let', code: CodeMaker) {
    code.line(`${kind} ${definition.name}: ${definition.typeName} = ${definition.initializer()}`)
  }

  public writeInterfaceBlock(interfaceName: string, elements: Element[], code: CodeMaker) {
    code.openBlock(`interface ${interfaceName}`)
    elements.forEach(({ name, type }) => {
        code.line(`${name}: ${type}`)
    })
    code.closeBlock();
  }
}
