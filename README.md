# Cuery - Composable SQL Querying ![build status](https://travis-ci.org/Schniz/cuery.svg?branch=master)

A composable SQL query builder based on string literals and transformation functions :sparkles:

# Installation

```bash
yarn add cuery pg
# or
npm install --save cuery pg
```

# Usage

```js
import { sql } from 'cuery';

const usersWithName = sql`
  SELECT * FROM users
  WHERE name = ${params => params.name}
`;

legalUsers.execute({ name: "John" }) // all the users named "John"
```

# Running tests

- set the `DATABASE_URL` env variable for your PostgreSQL server - defaults to `localhost`
- `yarn test`
