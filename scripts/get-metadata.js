// Script to extract all of the unique CDIDs within a series of datasets
// Outputs an array of datasets + metadata, and the CDIDs within each
import { readFileSync, writeFileSync } from "fs";
import { csvParseRows } from "d3-dsv";
import { fetch } from "./utils.js";

const inPath = "./output/datasets.json";
const outPath = "./output/metadata.json";

async function getMetadata(dataset) {
    console.log(`Fetching ${dataset.id}`);
    const meta = JSON.parse(await fetch(`https://www.ons.gov.uk${dataset.path}/data`));
    const csv = await fetch(`https://www.ons.gov.uk/file?uri=${dataset.path}/current/${dataset.id}.csv`);
    const rows = csvParseRows(csv);
    const metadata = {
        id: dataset.id,
        title: meta.description.title.trim(),
        summary: meta.description.summary,
        topic: dataset.path.split("/datasets/")[0],
        keywords: meta.description.keywords,
        cdids: []
    }
    for (let i = 1; i < rows[0].length; i ++) {
        metadata.cdids.push({
            cdid: rows[1][i].toLowerCase(),
            title: rows[0][i],
            preUnit: rows[2][i],
            unit: rows[3][i]
        });
    }
    return metadata;
}

async function getAllMetadata(datasets) {
    const metadata = [];
    for (const dataset of datasets) {
        const meta = await getMetadata(dataset);
        metadata.push(meta);
    }
    writeFileSync(outPath, JSON.stringify(metadata));
    console.log(`Wrote ${outPath}`);
}

console.log("Getting metadata and CDIDs for each timeseries dataset...");
const datasets = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);
getAllMetadata(datasets);