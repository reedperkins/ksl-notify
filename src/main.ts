import { db } from "./db.js";
import { kslImporter } from "./importer.js";
import { reporter } from "./reporter.js";

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => 
  process.on(signal, async (error) => {
    console.error('Signal received:', signal);
    await db.cleanUp();
    process.exit(1);
  })
);

async function main() {
  try {
    await kslImporter.importListings();
    await reporter.sendReport();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error:', message);
    await db.cleanUp();
    process.exit(1);
  }
  await db.cleanUp();
}

await main();
