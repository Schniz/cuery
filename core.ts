type Primitive = string | boolean | number;
export type Param<T> = (data: T) => any;
export type AstNode<InputData> =
  | {
      type: "computed";
      value: Param<InputData>;
    }
  | {
      type: "primitive";
      value: Primitive;
    }
  | {
      type: "string";
      value: string;
    };

export abstract class Query<Input, Output> {
  nodes: AstNode<Input>[];
  constructor(nodes: AstNode<Input>[]) {
    this.nodes = nodes;
  }
}

class Raw {
  value: Primitive;

  constructor(value: Primitive) {
    this.value = value;
  }

  toString() {
    return String(this.value);
  }
}

export function raw(primitive: Primitive) {
  return new Raw(primitive);
}

export type SqlFunctionParam<Input, Output> =
  | AstNode<Input>[]
  | Query<Input, Output>
  | Param<Input>
  | Raw
  | Primitive;

export function parse<Input, Output>(
  strings: TemplateStringsArray,
  ...params: SqlFunctionParam<Input, Output>[]
): AstNode<Input>[] {
  const nodes = [] as AstNode<Input>[];

  for (const index in strings) {
    const string = strings[index];
    const param = params[index];

    nodes.push({ type: "string", value: string });

    if (!param) {
    } else if (param instanceof Query) {
      nodes.push(...param.nodes);
    } else if (param instanceof Raw) {
      nodes.push({ type: "string", value: param.toString() });
    } else if (Array.isArray(param)) {
      nodes.push(...param);
    } else if (typeof param === "function") {
      nodes.push({ type: "computed", value: param });
    } else {
      nodes.push({ type: "primitive", value: param });
    }
  }

  return nodes;
}
