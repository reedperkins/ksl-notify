export interface KslClient {
  getSearchResults(url: URL): Promise<string>;
}

export const kslClient = createKslClient();

export function createKslClient(): KslClient {
  const _fetch = async (url: URL, method: "get" = "get") => {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: "https://www.google.com/",
      DNT: "1",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
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
