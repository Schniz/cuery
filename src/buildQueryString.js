// @flow

import Query from "./Query";
import { type SqlFunctionParameter } from "./types";

const getMaxParameterNumber = queries =>
  queries.reduce((acc, curr) => acc + curr.queryMeta.params.length, 1);

const getQueries = (params): Array<Query> => {
  let arr = [];
  for (let i = 0; i < params.length; i++) {
    if (params[i] instanceof Query) {
      arr.push(params[i]);
    }
  }
  return arr;
};

export default function buildQuery(
  strings: Array<string>,
  parameters: Array<SqlFunctionParameter | Query>
) {
  const startingFrom = getMaxParameterNumber(getQueries(parameters));
  let paramIndex = 0;

  return strings.reduce((acc, str, i) => {
    const parameter = parameters[i];
    if (parameter && parameter instanceof Query) {
      const string = parameter.queryMeta.query;
      return acc + str + string;
    } else if (parameter) {
      const string = `$${startingFrom + paramIndex}`;
      paramIndex++;
      return acc + str + string;
    } else {
      return acc + str;
    }
  }, "");
}
