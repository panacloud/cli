import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: { getToDos: { arguments: {}; response: ToDo[] }[] };
};
