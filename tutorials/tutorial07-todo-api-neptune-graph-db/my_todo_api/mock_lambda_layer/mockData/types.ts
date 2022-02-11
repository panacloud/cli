export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: any;
  AWSDateTime: any;
  AWSEmail: any;
  AWSIPAddress: any;
  AWSJSON: any;
  AWSPhone: any;
  AWSTime: any;
  AWSTimestamp: any;
  AWSURL: any;
}

export interface Mutation {
  __typename?: "Mutation";
  createToDo?: Maybe<ToDo>;
  deleteToDo?: Maybe<Scalars["String"]>;
  deleteToDos?: Maybe<Scalars["String"]>;
  updateToDo?: Maybe<ToDo>;
}

export interface MutationCreateToDoArgs {
  toDoInput?: InputMaybe<ToDoInput>;
}

export interface MutationDeleteToDoArgs {
  toDoId: Scalars["ID"];
}

export interface MutationUpdateToDoArgs {
  toDoId: Scalars["ID"];
  toDoInput?: InputMaybe<ToDoInput>;
}

export interface Query {
  __typename?: "Query";
  getToDo: ToDo;
  getToDos: Array<ToDo>;
}

export interface QueryGetToDoArgs {
  toDoId: Scalars["ID"];
}

export interface ToDo {
  __typename?: "ToDo";
  description: Scalars["String"];
  id: Scalars["ID"];
  title: Scalars["String"];
}

export interface ToDoInput {
  description: Scalars["String"];
  title: Scalars["String"];
}
