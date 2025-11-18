export type Field = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: {
    table: string;
    field: string;
  };
};

export type Table = {
  id: string;
  name: string;
  fields: Field[];
};

export type Relation = {
  from: string;
  to: string;
  fromField: string;
  toField: string;
  name: string;
};

export type DatabaseSchema = {
  id: string;
  name: string;
  description?: string;
  schema: string;
  tables: Table[];
  relations: Relation[];
  createdAt: string;
};

export type SavedSchemas = {
  [key: string]: DatabaseSchema;
};
