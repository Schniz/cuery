import * as Mysql from "mysql";
import { parse, Param, AstNode, Query, SqlFunctionParam } from "./core";

type CompiledQuery<Input> = {
  queryString: string;
  params: Param<Input>[];
};

type ExecuteOptions = {
  connection: Mysql.Connection;
};

export class MysqlQuery<Input, Output> extends Query<Input, Output> {
  compiledQuery?: CompiledQuery<Input>;

  compile() {
    if (!this.compiledQuery) {
      this.compiledQuery = formatAst(this.nodes);
    }

    return this.compiledQuery;
  }

  execute(data: Input, options: ExecuteOptions) {
    const formattedQuery = format(data, options.connection, this.compile());
    return new Promise<Output[]>((res, rej) => {
      options.connection.query(formattedQuery, (err, result) => {
        if (err) return rej(err);
        const output = result as Output[];
        return res(output);
      });
    });
  }
}

export class MysqlQueryWithDefaults<Input, Output> extends MysqlQuery<
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

function formatAst<Input>(nodes: AstNode<Input>[]) {
  let queryString = "";
  const params: Param<Input>[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "string":
        queryString += node.value;
        break;
      case "computed":
        queryString += "?";
        params.push(node.value);
        break;
      case "primitive":
        queryString += "?";
        params.push(function() {
          return node.value;
        });
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
  return new MysqlQuery<Input, Output>(nodes);
}

export function format<A>(
  data: A,
  mysql: Mysql.Connection,
  { queryString, params }: CompiledQuery<A>
) {
  return mysql.format(queryString, params.map(fn => fn(data)));
}

export function createSqlWithDefaults(options: ExecuteOptions) {
  return function sql<Input, Output>(
    strings: TemplateStringsArray,
    ...params: SqlFunctionParam<Input, Output>[]
  ) {
    const nodes = parse(strings, ...params);
    return new MysqlQueryWithDefaults<Input, Output>(nodes, options);
  };
}

export { raw } from "./core";
