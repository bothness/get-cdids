// Script to establish which ONS topic pages include timeseries data
// Outputs metadata for relevant topic pages and the timeseries they include
import { readFileSync, writeFileSync } from "fs";
import { fetch } from "./utils.js";

const inPath = "./output/topics.json";
const outPath = "./output/pages.json";

async function getPages(topic) {
    const url = `https://www.ons.gov.uk${topic.slug}/data`;
    console.log(`Fetching ${url}`);
    const str = await fetch(url);
    const json = JSON.parse(str);
    return json.items;
}

async function getAllPages(topics) {
    const ts = [];
    for (const topic of topics) {
        const timeseries = await getPages(topic);
        if (timeseries.length > 0) ts.push({...topic, timeseries});
    }
    writeFileSync(outPath, JSON.stringify(ts));
    console.log(`Wrote ${outPath}`);
}

console.log("Finding topic pages with embedded timeseries...");
const topics = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);
getAllPages(topics);