import postgres from "postgres";

const options: postgres.Options<{}> = {
  database: "ksl_notify",
  transform: postgres.camel,
};

console.log(process.env.DATABASE_URL);
export const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, options)
  : postgres(options);

export interface Db {
  getReportRows(): Promise<any[]>
  cleanUp(): Promise<void>
}

export const db: Db = {
  getReportRows,
  cleanUp
};

async function getReportRows(): Promise<any[]> {
  return await sql`
    select
      l.*,
      jsonb_agg(s.*) as searches,
      jsonb_agg(
        jsonb_build_object(
          'type', le."type",
          'date', le.occured_on,
          'data', le."data"
        )
      ) as history
    from listings l
    join search_listings sl on sl.listing_id = l.id
    join searches s on sl.search_id = s.id
    join listing_events le on le.listing_id = l.id
    where sent_on is null
    group by l.id`;
}

async function cleanUp() {
  console.log("Closing db connections...");
  await sql.end();
  console.log("Db connections closed!");
};
