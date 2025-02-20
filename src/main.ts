import { HTMLElement, parse } from "node-html-parser";
import * as fs from "node:fs/promises";
import { sql } from "./db.js";
import nodemailer from "nodemailer";

interface Search {
  id: number;
  url: string;
}

async function getSearches(): Promise<Search[]> {
  return await sql<Search[]>`select * from searches`;
}

interface KslClient {
  getSearchResults(url: URL): Promise<string>;
}

function createKslClient(): KslClient {
  const _fetch = async (url: URL, method: "get" = "get") => {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    };

    const response = await fetch(url, {
      method,
      headers,
    });

    const body = await response.text();
    if (response.ok) {
      return body;
    }

    throw new Error(`Http error ${response.status}: ${body}`);
  };

  return {
    async getSearchResults(url: URL) {
      return _fetch(url);
    },
  };
}

async function importListings() {
  console.log("Getting searches from db");
  const searches = await getSearches();
  for (const search of searches) {
    console.log(search);
    const kslClient = createKslClient();
    // const html = await fs.readFile("gretsch_drum.html", "utf-8");
    const html = await kslClient.getSearchResults(new URL(search.url));
    console.log(html.substring(0, 500));
    const root = parse(html);
    const listingNodes = root.querySelectorAll("section");
    const listings = listingNodes.map(parseListingNode);
    console.log(`Found ${listings.length} listings`);

    console.log("Saving listings to db");
    for (const listing of listings) {
      const [{ listingId }] = await sql<{ listingId: number }[]>`
        insert into listings ${sql(listing)}
        on conflict (ksl_id) do update set
          title = excluded.title,
          price = excluded.price,
          location = excluded.location
        returning id as listing_id`;

      await sql`insert into search_listings (search_id, listing_id)
        values ( ${search.id}, ${listingId} )
        on conflict (search_id, listing_id) do nothing`;
    }
    console.log("Saved listings to db");
    await new Promise((r) =>
      setTimeout(r, Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000)
    );
  }
}

interface Listing {
  id: number;
  ksl_id: string;
  title: string;
  price: number;
  location: string;
}

async function getListingsFromDb(): Promise<Listing[]> {
  return await sql<Listing[]>`select * from listings`;
}

interface Report {
  createdOn: Date;
  listings: Listing[];
}

function createListingReport(listings: Listing[]): Report {
  return {
    createdOn: new Date(),
    listings,
  };
}

interface EmailClient {
  sendMessage(to: string, from: string, subject: string, body: string): void;
}

function createEmailClient(): EmailClient {
  const appUser = process.env.FASTMAIL_APP_USER;
  const appPassword = process.env.FASTMAIL_APP_PASSWORD;
  if (!appUser || !appPassword) throw new Error("Missing email credentials");

  const transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    auth: {
      user: appUser,
      pass: appPassword,
    },
  });

  return {
    async sendMessage(to: string, from: string, subject: string, body: string) {
      const mailOptions = {
        to,
        from,
        subject,
        text: body,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    },
  };
}

async function sendReport(report: Report) {
  const client = createEmailClient();
  const message = JSON.stringify(report);
  await client.sendMessage('reed@reedperkins.com', 'reed@reedperkins.com', 'KSL Notify report', message);
}

async function main() {
  await importListings();
  const listings = await getListingsFromDb();
  const report = createListingReport(listings);
  await sendReport(report);
}

function parseListingNode(listingNode: HTMLElement) {
  const listingIdRegex = /\/listing\/(\d+)/;
  const listingTitleNode = listingNode.querySelector(".item-info-title-link");
  const href = listingTitleNode?.querySelector("a")?.getAttribute("href");
  const rawPrice = listingNode.querySelector(
    ".item-info-price.info-line"
  )?.text;
  const locationNode = listingNode.querySelector("a.item-address");

  const title = listingTitleNode?.text || "Missing title";
  const [, kslId = "Missing listing id"] = href?.match(listingIdRegex) || [];
  const price = Number(rawPrice?.replace(/[^0-9.]/g, "")) || -1;
  const location = locationNode?.text || "Missing location";

  return { title, kslId, price, location };
}

await main().finally(async () => await sql.end());
