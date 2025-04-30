// Script to identify timeseries datasets based on pages for individual CDIDs
// Outputs an array of unique timeseries datasets (ids and paths)
import { readFileSync, writeFileSync } from "fs";
import { fetch } from "./utils.js";

const inPath = "./output/pages.json";
const outPath = "./output/datasets.json";

function getPaths(timeseries) {
    const paths = timeseries
        .map(d => d.timeseries)
        .flat()
        .map(d => d.uri)
        .map(d => {
            const parts = d.split("/");
            let dataset = null;
            if (parts[parts.length - 3] === "timeseries") {
                dataset = parts[parts.length - 1];
            }
            return {dataset, path: d};
        });
    const datasets = paths.map(d => d.dataset);
    return paths.filter((d, i) => !d.dataset || datasets.indexOf(d.dataset) === i)
        .map(d => d.path);
}

async function getDownloadPath(path) {
    const url = `https://www.ons.gov.uk${path}/data`;
    console.log(`Fetching ${url}`);
    const str = await fetch(url);
    const json = JSON.parse(str);
    return {
        id: json.description.datasetId.toLowerCase(),
        path: json.relatedDatasets[0].uri
    };
}

async function getAllDownloadPaths(pages) {
    const paths = getPaths(pages);
    let datasets = [];
    for (const path of paths) {
        const ds = await getDownloadPath(path);
        datasets.push(ds);
    }
    const ids = datasets.map(d => d.id);
    datasets = datasets
        .filter((d, i) => ids.indexOf(d.id) === i);
    writeFileSync(outPath, JSON.stringify(datasets));
    console.log(`Wrote ${outPath}`);
}

console.log("Getting unique timeseries dataset paths...");
const pages = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);
getAllDownloadPaths(pages);