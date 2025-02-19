import postgres from "postgres";

const options: postgres.Options<{}> = {
  database: "ksl_notify",
  transform: postgres.camel,
};

console.log(process.env.DATABASE_URL);
export const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, options)
  : postgres(options);

const cleanup = async () => {
  console.log("Closing database connections...");
  await sql.end();
  process.exit(0);
};

process.on("SIGINT", cleanup); // Ctrl+C
process.on("SIGTERM", cleanup); // kill command
process.on("SIGQUIT", cleanup); // Ctrl+\
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await cleanup();
});
