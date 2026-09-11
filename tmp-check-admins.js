const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

(async () => {
  await client.connect();
  const admins = await client.query(`
    SELECT dni, nombre, rol, cuenta_activa
    FROM recursoshumanos.users
    WHERE rol = 'admin'
       OR dni LIKE '%0000%'
       OR dni LIKE '%9999%'
    ORDER BY dni
  `);
  console.log("admins=" + JSON.stringify(admins.rows, null, 2));
  const sample = await client.query(`
    SELECT dni, nombre FROM recursoshumanos.users ORDER BY nombre LIMIT 10
  `);
  console.log("sample=" + JSON.stringify(sample.rows, null, 2));
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='recursoshumanos' AND table_name='users'
    ORDER BY ordinal_position
  `);
  console.log("cols=" + cols.rows.map((r) => r.column_name).join(","));
  await client.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
