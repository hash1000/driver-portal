async function run() {
  const { default: Database } = await import("better-sqlite3");
  const db = new Database("dev.db");
  try {
    db.exec("ALTER TABLE Site ADD COLUMN siteType TEXT NOT NULL DEFAULT 'both'");
    console.log("siteType column added");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(message);
  } finally {
    db.close();
  }
}

void run();
