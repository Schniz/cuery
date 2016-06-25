import test from 'ava';
import execute, { connect, doQuery } from '../src/execute';
import paginate from '../src/paginate';
import Query from '../src/Query';

const getRows = (...args) => execute(...args).then(e => e.rows);
const tableRandom = Math.floor(Math.random() * 10000);
const tableName = `test__people_${tableRandom}`;
const seed = [{
  name: 'Gal Schlezinger',
  age: 24,
}, {
  name: 'Joe Developer',
  age: 40,
}];

test.before(async () => {
  const conn = await connect();
  await doQuery(conn, `
    CREATE TABLE "public"."${tableName}" (
      id serial PRIMARY KEY,
      name text,
      age integer
    )
  `, []);

  const insertions = seed.map(e => `('${e.name}', ${e.age})`);
  const query = `
    INSERT INTO "public"."${tableName}" (name, age)
    VALUES ${insertions.join(', ')}
  `;
  await doQuery(conn, query, []);
});

test.after(async () => {
  const conn = await connect();
  await doQuery(conn, `DROP TABLE "public"."${tableName}"`, []);
});

test('simple query', async t => {
  const simple = Query.of({
    query: `SELECT * FROM ${tableName}`,
    params: [],
  });

  const { rows } = await execute(simple, {});
  t.is(rows.length, 2);
});

test('query with params', async t => {
  const simple = Query.of({
    query: `SELECT * FROM ${tableName} WHERE age = $1`,
    params: ['age'],
  });

  const rows = await getRows(simple, { age: 24 });
  t.is(rows.length, 1);
  t.is(rows[0].name, 'Gal Schlezinger');
});

test('paginated query', async t => {
  const simple = Query.of({
    query: `SELECT * FROM ${tableName}`,
    params: [],
  });
  const simpleWithParam = Query.of({
    query: `SELECT * FROM ${tableName} WHERE age = $1`,
    params: ['age'],
  });

  const paginated = simple.map(paginate);
  const paginatedWithParams = simpleWithParam.map(paginate);

  let rows = await getRows(paginated, { limit: 1, offset: 0 });
  t.is(rows.length, 1);
  t.is(rows[0].name, 'Gal Schlezinger');

  rows = await getRows(paginated, { limit: 1, offset: 1 });
  t.is(rows.length, 1);
  t.is(rows[0].name, 'Joe Developer');

  rows = await getRows(paginatedWithParams, { age: 24, limit: 1, offset: 0 });
  t.is(rows.length, 1);
  t.is(rows[0].name, 'Gal Schlezinger');

  rows = await getRows(paginatedWithParams, { age: 24, limit: 1, offset: 1 });
  t.is(rows.length, 0);
});
