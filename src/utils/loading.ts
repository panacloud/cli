import { readFileSync } from "fs";
import { buildASTSchema, concatAST, GraphQLSchema, Source,parse, DocumentNode } from "graphql";
import { join, normalize } from "path";

export function loadSDLSchema(schemaPath: string): GraphQLSchema {
    const authDirectivePath = normalize(join(__dirname, '../../','awsAppSyncDirectives.graphql'));
    const doc = loadAndMergeQueryDocuments([authDirectivePath, schemaPath]);
    return buildASTSchema(doc);
}

export function loadAndMergeQueryDocuments(inputPaths: string[], tagName: string = 'gql'): DocumentNode {
    const sources = inputPaths
      .map(inputPath => {
        const body = readFileSync(inputPath, 'utf8');
        if (!body) {
          return null;
        }
        return new Source(body, inputPath);
      })
      .filter(source => source);
  
    return concatAST((sources as Source[]).map(source => parse(source)));
  }
  