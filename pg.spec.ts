import { raw, sql, createSqlWithDefaults } from "./pg";
import Pg from "pg";
import { Query } from "./core";

let pool: Pg.Pool;

beforeAll(async () => {
  pool = new Pg.Pool({
    user: "postgres",
    host: "localhost",
    port: 5432,
    password: "password",
    database: "postgres"
  });
});

afterAll(async () => {
  await pool.end();
});

test("with default", async () => {
  const sql = createSqlWithDefaults({ pool });

  const simpleQuery = sql<{ name: string }, { name: string }>`
    SELECT ${p => p.name} AS name
  `;

  const result = await simpleQuery.execute({ name: "Gal" });

  expect(result[0].name).toBe("Gal");
});

test("simple query", async () => {
  const simpleQuery = sql<{ name: string }, { name: string }>`
    SELECT ${p => p.name} AS name
  `;

  const result = await simpleQuery.execute({ name: "Gal" }, { pool });

  expect(result[0].name).toBe("Gal");
});

test("composition", async () => {
  const simpleQuery = sql<{ name: string }, { name: string }>`
    SELECT ${p => p.name} AS name
  `;

  const composition = sql<{ name: string }, { uppercased: string }>`
    SELECT UPPER(simple.name) AS uppercased
    FROM (${simpleQuery}) simple
  `;

  const result = await composition.execute({ name: "Gal" }, { pool });

  expect(result[0].uppercased).toBe("GAL");
});

test("a query composition function", async () => {
  function limit<Input, Output>(query: Query<Input, Output>) {
    return sql<Input & { limit: Number; offset: Number }, Output>`
      SELECT *
      FROM (${query}) LIMITED__QUERY__${raw(Math.floor(Math.random() * 99999))}
      LIMIT ${p => p.limit}
      OFFSET ${p => p.offset}
    `;
  }

  const simpleQuery = sql<{}, { name: string }>`
    SELECT *
    FROM (VALUES ('hello'), ('world')) names(name)
  `;

  const limited = limit(simpleQuery);

  const result = await limited.execute({ limit: 1, offset: 0 }, { pool });

  console.log(result);
});
