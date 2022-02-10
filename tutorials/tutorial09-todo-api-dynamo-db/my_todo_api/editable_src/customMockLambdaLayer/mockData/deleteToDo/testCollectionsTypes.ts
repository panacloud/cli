import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: {
    deleteToDo: { arguments: MutationDeleteToDoArgs; response: ToDo }[];
  };
};
