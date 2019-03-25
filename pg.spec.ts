import { sql, createSqlWithDefaults } from "./pg";
import Pg from "pg";

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
