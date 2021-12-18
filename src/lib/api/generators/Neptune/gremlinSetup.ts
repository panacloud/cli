import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";

type StackBuilderProps = {
  config: ApiModel;
};

export class GremlinSetupFile {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.neptuneDB}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async gremlinSetup() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile("gremlin_init.ts");

    ts.writeImports("gremlin", ["driver", "process as gprocess", "structure"]);
    ts.writeVariableDeclaration(
      {
        name: "Graph",
        typeName: "",
        initializer: () => {
          this.code.line(`structure.Graph`);
        },
      },
      "const"
    );
    this.code.line(`
    export function initializeGremlinClient(endpoint: string) {
      let conn: driver.DriverRemoteConnection;
      let g: gprocess.GraphTraversalSource;
    
      const getConnectionDetails = () => {
        const database_url = "wss://" + endpoint + ":8182/gremlin";
    
        return { url: database_url, headers: {} };
      };
    
      const createRemoteConnection = () => {
        const { url, headers } = getConnectionDetails();
    
        console.log("creating remote connection");
    
        return new driver.DriverRemoteConnection(url, {
          mimeType: "application/vnd.gremlin-v2.0+json",
          pingEnabled: false,
          headers: headers,
        });
      };
    
      conn = createRemoteConnection();
      const graph = new Graph();
      g = graph.traversal().withRemote(conn);
    
      return { g: g, conn: conn };
    }
    `);

    this.code.closeFile("gremlin_init.ts");
    await this.code.save("editable_src/customMockLambdaLayer/utils");
  }
}

export const GremlinSetup = async (props: StackBuilderProps): Promise<void> => {
  const builder = new GremlinSetupFile(props);
  await builder.gremlinSetup();
};
