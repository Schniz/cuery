# Cuery - Composable SQL Querying ![build status](https://travis-ci.org/Schniz/cuery.svg?branch=master)

Implementation for a medium blog post..

# Installation

`npm install --save cuery`

# Usage

```js
import { Query, paginate, execute } from 'cuery';

const myQuery = Query.of({
  query: 'SELECT * FROM users WHERE age = $1',
  params: ['userAge']
});

const myQueryPaginated = myQuery.map(paginate);

execute(myQueryPaginated, { userAge: 24, limit: 5, offset: 10 }); // execute the pagination query
```

you can also see [the tests](./test/query.js)

# Running tests

- set the `DATABASE_URL` env variable for your PostgreSQL server - defaults to `localhost`
- `npm test`
