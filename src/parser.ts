import { HTMLElement, parse } from "node-html-parser";
import { Listing } from "./types.js";

interface Parser {
  parseListings(html: string): Listing[]
}

export const parser: Parser = {
  parseListings
}

function parseListings(html: string): Listing[] {
  const root = parse(html);
  const listingNodes = root.querySelectorAll("section");
  const listings = listingNodes.map(parseListingNode);
  return listings;
}

function parseListingNode(listingNode: HTMLElement): Listing {
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
  const listing: Listing =  { title, kslId, price, location };
  return listing;
}
