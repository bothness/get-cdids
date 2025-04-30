// This script merges the topic paths for each CDID into the metadata for all datasets
// Outputs extended metadata JSON with topic paths per CDID
import { readFileSync, writeFileSync } from "fs";
import { csvParse } from "d3-dsv";

const inPath = "./output/metadata.json";
const csvPath = "./output/metadata.csv";
const outPath = "./output/allmetadata.json";

function mergeMetadata(json, array) {
    const topics = {};
    for (const d of array) topics[`${d.dsid}_${d.cdid}`] = d.topic;
    console.log(array[0], topics[`${array[0].dsid}_${array[0].cdid}`]);
    const metadata = json.map(d => {
        const _d = {...d};
        _d.cdids = d.cdids.map(c => ({
            ...c,
            topic: topics?.[`${d.id}_${c.cdid}`]
        }));
        return _d;
    });
    writeFileSync(outPath, JSON.stringify(metadata));
    console.log(`Wrote ${outPath}`);
}

console.log("Merging topics for all CDIDs...");
const json = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);
const array = csvParse(
    readFileSync(csvPath, { encoding: 'utf8', flag: 'r' })
);
mergeMetadata(json, array);