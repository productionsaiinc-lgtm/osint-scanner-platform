import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigration() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL not set');
      process.exit(1);
    }

    // Parse connection string
    const url = new URL(dbUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
      ssl: { rejectUnauthorized: false },
    });

    console.log('✓ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'drizzle/0004_tearful_jean_grey.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

    console.log(`\nApplying ${statements.length} migration statements...\n`);

    // Execute each statement
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        const tableMatch = stmt.match(/CREATE TABLE `(\w+)`/);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        console.log(`✓ Created table: ${tableName}`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          const tableMatch = stmt.match(/CREATE TABLE `(\w+)`/);
          const tableName = tableMatch ? tableMatch[1] : 'unknown';
          console.log(`⚠ Table already exists: ${tableName}`);
        } else {
          console.error(`✗ Error: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('\n✓ Migration complete!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES LIKE "%sim%"');
    console.log(`\nSIM Swap tables in database: ${tables.length}`);
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });

    await connection.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
