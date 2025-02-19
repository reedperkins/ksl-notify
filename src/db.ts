import postgres from "postgres";

export const sql = postgres({
  database: "ksl_notify",
  transform: postgres.camel,
});

const cleanup = async () => {
  console.log('Closing database connections...');
  await sql.end();
  process.exit(0);
};

process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGTERM', cleanup); // kill command
process.on('SIGQUIT', cleanup); // Ctrl+\
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await cleanup();
});
