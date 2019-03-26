import expect from "expect";
import * as Mysql from "mysql";
import { sql, createSqlWithDefaults } from "./mysql";

let connection: Mysql.Connection;

beforeAll(() => {
  connection = connect();
});

afterAll(() => {
  connection.end();
});

test("with default options", async () => {
  const sql = createSqlWithDefaults({ connection });

  const simpleQuery = sql<{ name: string }, { providedName: string }>`
    SELECT ${p => p.name} AS providedName FROM DUAL
  `;

  const result = await simpleQuery.execute({ name: "Gal" });

  expect(result[0].providedName).toBe("Gal");
});

test("simple query", async () => {
  const simpleQuery = sql<{ name: string }, { providedName: string }>`
    SELECT ${p => p.name} AS providedName FROM DUAL
  `;

  const result = await simpleQuery.execute({ name: "Gal" }, { connection });

  expect(result[0].providedName).toBe("Gal");
});

test("composition", async () => {
  const simpleQuery = sql<{ name: string }, { providedName: string }>`
    SELECT ${p => p.name} AS name FROM DUAL
  `;
  const composition = sql<{ name: string }, { uppercased: string }>`
    SELECT UPPER(name) AS uppercased FROM (${simpleQuery}) simple_query
  `;

  const result = await composition.execute({ name: "Gal" }, { connection });

  expect(result[0].uppercased).toBe("GAL");
});

function connect() {
  const connection = Mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
  });

  return connection;
}
