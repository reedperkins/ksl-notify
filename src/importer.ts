import { sql } from "./db.js";
import { kslClient } from "./ksl_client.js";
import { parser } from "./parser.js";
import { Listing, Search } from "./types.js";

interface Importer {
  importListings(): Promise<void>;
}

export const kslImporter: Importer = {
  importListings: importListingsFromKsl,
};

async function importListingsFromKsl() {
  console.log("Searching ksl for listings");
  const searches = await sql<Search[]>`select * from searches`;
  for (const search of searches) {
    console.log(`Getting listings for ${search.url}`);
    // const html = await fs.readFile("gretsch_drum.html", "utf-8");
    const html = await kslClient.getSearchResults(new URL(search.url));
    // console.log(html.substring(0, 500));
    const listings = parser.parseListings(html);
    console.log(`Found ${listings.length} listings`);
    for (const listing of listings) {
      const [{ id: listingId, price } = {}] = await sql<[Listing?]>`
        select *, price::float from listings where ksl_id = ${listing.kslId}`;
      if (listingId) {
        // Check for price update
        const data = { old: price, new: listing.price };
        if (data.old !== data.new) {
          console.log(`Updating listing price from ${data.old} to ${data.new}`);
          await sql`
            insert into listing_events (listing_id, type, data) 
            values (${listingId}, 'price_changed', ${sql.json(data)})`;
        }

        // Check if listing matches another search
        const searchIds = (
          await sql<{ searchId: number }[]>`
          select search_id from search_listings where listing_id = ${listingId}`
        ).map((x) => x.searchId);
        if (!searchIds.includes(search.id)) {
          await sql`
            insert into search_listings (search_id, listing_id)
            values ( ${search.id}, ${listingId} )`;
        }
      } else {
        console.log("Creating new listing");
        await sql.begin(async (tx) => {
          const [{ id: listingId }] = await tx<[{ id: number }]>`
            insert into listings ${sql(listing)} returning id`;
          await tx`
            insert into listing_events (listing_id, type)
            values (${listingId}, 'discovered')`;
          await tx`
            insert into search_listings (search_id, listing_id)
            values ( ${search.id}, ${listingId} )`;
        });
      }
    }

    console.log("Saved listings to db");
    await new Promise((r) =>
      setTimeout(r, Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000)
    );
  }
}
