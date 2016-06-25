// @flow

export type QueryData = {
  query: string;
  params: Array<string>;
};

export default class Query {
  static of(queryData: QueryData) {
    return new Query(queryData);
  }

  queryData : QueryData;

  constructor(queryData : QueryData) {
    this.queryData = queryData;
  }

  map(f : (queryData : QueryData) => QueryData) {
    return Query.of(f(this.queryData));
  }
}
