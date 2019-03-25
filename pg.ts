import { Query, SqlFunctionParam, parse, Param, AstNode } from "./core";
import * as Pg from "pg";

type CompiledQuery<Input> = {
  queryString: string;
  params: Param<Input>[];
};

type ExecuteOptions = {
  pool: Pg.Pool;
};

class PostgresQuery<Input, Output> extends Query<Input, Output> {
  compiledQuery?: CompiledQuery<Input>;

  compile() {
    if (!this.compiledQuery) {
      this.compiledQuery = formatAst(this.nodes);
    }

    return this.compiledQuery;
  }

  async execute(data: Input, options: ExecuteOptions) {
    const queryData = this.compile();
    const params = queryData.params.map(fn => fn(data));
    const results = await options.pool.query(queryData.queryString, params);
    return results.rows as Output[];
  }
}

class PostgresQueryWithDefault<Input, Output> extends PostgresQuery<
  Input,
  Output
> {
  defaultOptions: ExecuteOptions;

  constructor(nodes: AstNode<Input>[], defaultOptions: ExecuteOptions) {
    super(nodes);
    this.defaultOptions = defaultOptions;
  }

  async execute(data: Input, options?: ExecuteOptions) {
    return super.execute(data, options || this.defaultOptions);
  }
}

function formatAst<Input>(nodes: AstNode<Input>[]): CompiledQuery<Input> {
  const params = [] as Param<Input>[];
  let queryString = "";

  for (const node of nodes) {
    switch (node.type) {
      case "string":
        queryString += node.value;
        break;
      case "primitive":
        params.push(() => node.value);
        queryString += `$${params.length}`;
        break;
      case "computed":
        params.push(node.value);
        queryString += `$${params.length}`;
        break;
    }
  }

  return { queryString, params };
}

export function sql<Input, Output>(
  strings: TemplateStringsArray,
  ...params: SqlFunctionParam<Input, Output>[]
) {
  const nodes = parse(strings, ...params);
  return new PostgresQuery<Input, Output>(nodes);
}

export function createSqlWithDefaults(defaultOptions: ExecuteOptions) {
  return function sql<Input, Output>(
    strings: TemplateStringsArray,
    ...params: SqlFunctionParam<Input, Output>[]
  ) {
    const nodes = parse(strings, ...params);
    return new PostgresQueryWithDefault<Input, Output>(nodes, defaultOptions);
  };
}
