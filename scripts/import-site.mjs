import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const SITE_ORIGIN = "https://mochii.framer.website";
const ROUTES = ["/", "/privacy", "/terms-of-use", "/eula", "/help"];
const USER_AGENT =
  "Mozilla/5.0 (compatible; MochiiSiteImporter/1.0; +https://mochii.framer.website)";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GENERATED_DIR = path.join(ROOT, "src", "content", "generated");
const PUBLIC_DIR = path.join(ROOT, "public", "assets", "imported");

const FONT_KEYS = {
  dmSansRegular:
    "rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhS2f3ZGMZpg.woff2",
  dmSansBold:
    "rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthS2f3ZGMZpg.woff2",
  hostGroteskRegular: "co3BmWBnlCJ3U42vbbfdwMjZpFjm.woff2",
  hostGroteskBold: "co3BmWBnlCJ3U42vbbfdwMjZqljm0U0.woff2",
  interRegular: "GrgcKwrN6d3Uz8EwcLHZxwEfC4.woff2",
  interBold: "syRNPWzAMIrcJ3wIlPIP43KjQs.woff2",
};

await mkdir(GENERATED_DIR, { recursive: true });
await mkdir(path.join(PUBLIC_DIR, "fonts"), { recursive: true });
await mkdir(path.join(PUBLIC_DIR, "images"), { recursive: true });

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch asset ${url}: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function normalizeWhitespace(text) {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function collectTextNodes($, route) {
  const items = [];
  let started = false;
  let previousText = "";

  $("h1, h2, p, li").each((_, element) => {
    const tag = element.tagName.toLowerCase();
    const text = normalizeWhitespace($(element).text());

    if (!text) {
      return;
    }

    if (!started) {
      if (tag !== "h1") {
        return;
      }
      started = true;
    }

    if (text === "Back to home") {
      return false;
    }

    if (route === "/" && text === "Navigation") {
      return false;
    }

    if (text === previousText) {
      return;
    }

    items.push({ tag, text });
    previousText = text;
  });

  return items;
}

function buildSections(items) {
  const [firstHeading, ...rest] = items;
  const lead = [];
  const sections = [];
  let currentSection = null;

  for (const item of rest) {
    if (item.tag === "h2") {
      currentSection = {
        title: item.text,
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (currentSection) {
      currentSection.blocks.push({
        type: item.tag === "li" ? "bullet" : "paragraph",
        text: item.text,
      });
    } else {
      lead.push({
        type: item.tag === "li" ? "bullet" : "paragraph",
        text: item.text,
      });
    }
  }

  return {
    title: firstHeading?.text ?? "",
    lead,
    sections,
  };
}

function extractMeta($, route, fallbackDescription) {
  const title = normalizeWhitespace($("title").first().text());
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    fallbackDescription ||
    "";
  const canonical =
    $('link[rel="canonical"]').attr("href") || `${SITE_ORIGIN}${route}`;

  return { title, description, canonical };
}

function extractSearchIndexUrl($) {
  return $('meta[name="framer-search-index"]').attr("content") || null;
}

function extractVisibleLinks($) {
  const seen = new Set();
  const links = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const text = normalizeWhitespace($(element).text());

    if (!href || !text) {
      return;
    }

    const key = `${href}::${text}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    links.push({ href, text });
  });

  return links;
}

function extractUrlsFromHtml(html) {
  const urls = new Set();
  const urlPattern = /https:\/\/[^"')\s<>]+/g;

  for (const match of html.matchAll(urlPattern)) {
    urls.add(match[0].replace(/&amp;/g, "&"));
  }

  return urls;
}

function pickPreferredAssetUrl(existing, candidate) {
  if (!existing) {
    return candidate;
  }

  const existingUrl = new URL(existing);
  const candidateUrl = new URL(candidate);
  const existingScaled = existingUrl.searchParams.has("scale-down-to");
  const candidateScaled = candidateUrl.searchParams.has("scale-down-to");

  if (existingScaled && !candidateScaled) {
    return candidate;
  }

  if (!existingScaled && candidateScaled) {
    return existing;
  }

  return existing.length >= candidate.length ? existing : candidate;
}

function buildAssetFilename(url) {
  const parsed = new URL(url);
  const originalName = path.basename(parsed.pathname);
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  const extension = path.extname(originalName);
  const basename = originalName.slice(0, originalName.length - extension.length);
  return `${basename}-${hash}${extension}`;
}

function categorizeAsset(url) {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  return extension === ".woff" || extension === ".woff2" ? "fonts" : "images";
}

function isDownloadableAsset(url) {
  const pathname = new URL(url).pathname;
  const extension = path.extname(pathname).toLowerCase();
  return [".svg", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2"].includes(extension);
}

function slugForRoute(route) {
  if (route === "/") {
    return "home";
  }

  return route.replace(/^\//, "").replace(/\//g, "-");
}

const routeHtml = {};
const routeSnapshots = {};
let sharedDescription = "";

for (const route of ROUTES) {
  const html = await fetchText(`${SITE_ORIGIN}${route}`);
  routeHtml[route] = html;
}

const home$ = cheerio.load(routeHtml["/"]);
const searchIndexUrl = extractSearchIndexUrl(home$);
const searchIndex = searchIndexUrl ? JSON.parse(await fetchText(searchIndexUrl)) : {};
sharedDescription =
  searchIndex["/"]?.description ||
  home$('meta[name="description"]').attr("content") ||
  "";

for (const route of ROUTES) {
  const html = routeHtml[route];
  const $ = cheerio.load(html);
  const items = collectTextNodes($, route);
  const structured = buildSections(items);

  routeSnapshots[route] = {
    route,
    slug: slugForRoute(route),
    meta: extractMeta($, route, sharedDescription),
    items,
    title: structured.title,
    lead: structured.lead,
    sections: structured.sections,
    links: extractVisibleLinks($),
  };
}

const assetCandidates = new Map();

for (const route of ROUTES) {
  for (const url of extractUrlsFromHtml(routeHtml[route])) {
    if (!url.includes("framerusercontent.com") && !url.includes("fonts.gstatic.com")) {
      continue;
    }

    if (!isDownloadableAsset(url)) {
      continue;
    }

    const parsed = new URL(url);
    const key = parsed.pathname;
    const previous = assetCandidates.get(key);
    assetCandidates.set(key, pickPreferredAssetUrl(previous, url));
  }
}

const assetMap = {};
const logicalAssets = {};
const fontMap = {};

for (const remoteUrl of assetCandidates.values()) {
  const category = categorizeAsset(remoteUrl);
  const localFileName = buildAssetFilename(remoteUrl);
  const localDir = path.join(PUBLIC_DIR, category);
  const localPath = path.join(localDir, localFileName);
  const localWebPath = `/assets/imported/${category}/${localFileName}`;
  const buffer = await fetchBuffer(remoteUrl);

  await writeFile(localPath, buffer);
  assetMap[remoteUrl] = localWebPath;

  const basename = path.basename(new URL(remoteUrl).pathname);
  if (basename === "Tol3Z4lBYoJ9nC3NSn1u39KW5k.svg") {
    logicalAssets.favicon = localWebPath;
  } else if (basename === "TLFJn5MUBGGvBUhB0MtBafodB1g.jpg") {
    logicalAssets.ogImage = localWebPath;
  } else if (basename === "xuQKZ6BntnNrQKvwCmf0kJDMeM8.png") {
    logicalAssets.logoImage = localWebPath;
  } else if (basename === "cvfYFahZUM1BAYhLDvvZYUG8vdQ.png") {
    logicalAssets.heroImage = localWebPath;
  } else if (basename === "6mcf62RlDfRfU61Yg5vb2pefpi4.png") {
    logicalAssets.noiseImage = localWebPath;
  }

  for (const [key, expectedName] of Object.entries(FONT_KEYS)) {
    if (basename === expectedName) {
      fontMap[key] = localWebPath;
    }
  }
}

const siteData = {
  generatedAt: new Date().toISOString(),
  origin: SITE_ORIGIN,
  routes: routeSnapshots,
  searchIndex,
  assets: {
    ...logicalAssets,
    fonts: fontMap,
  },
  assetMap,
  socialLinks: {
    primaryCta: "https://framer.link/7L9chrF",
    twitter: "https://www.twitter.com/",
    discord: "https://www.discord.com/",
    linkedin: "https://www.linkedin.com/",
  },
};

await writeFile(
  path.join(GENERATED_DIR, "site-data.json"),
  `${JSON.stringify(siteData, null, 2)}\n`,
);
