import { db, sql } from "./db.js";
import { emailClient } from "./email_client.js";
import { Report } from "./types.js";

interface Reporter {
  sendReport(): Promise<void>;
}

export const reporter: Reporter = {
  sendReport,
};

async function sendReport() {
  const toEmail = process.env.TO_EMAIL;
  const fromEmail = process.env.FROM_EMAIL;
  if(!toEmail || !fromEmail) {
    console.error('Missing email variables');
    return;
  }
  try {
    const rows = await db.getReportRows();
    if (!rows.length) {
      console.log("No listing events to send!");
      return;
    }
    const report = createListingReport(rows);
    const message = JSON.stringify(report, null, 2);
    emailClient.sendMessage(
      toEmail,
      fromEmail,
      "KSL Notify report",
      message
    );
    const ids: number[] = rows.map((row: any) => row.id);
    await sql`
      update listing_events set sent_on = now()
      where id in ${sql(ids)}`;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error sending report", message);
  }
  console.log("Report sent!");
}

function createListingReport(rows: any[]): Report {
  return {
    createdOn: new Date(),
    rows: rows.map((row: any) => ({
      ...row,
      link: `https://classifieds.ksl.com/listing/${row.kslId}`,
    })),
  };
}
