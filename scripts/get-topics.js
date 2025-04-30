// Extracts the lowest level topic pages from the ONS taxonomy
// Outputs an array of topics with titles and paths
import { readFileSync, writeFileSync } from "fs";

const inPath = "./output/taxonomy.json";
const outPath = "./output/topics.json";

console.log("Extracting topic pages from taxonomy...");
let topics = [];

function getTopics(items) {
    for (const item of items) {
        if (item.children.length > 0) {
            getTopics(item.children);
        } else topics.push(item);
    }
}

const taxonomy = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);

getTopics(taxonomy);
topics = [...topics]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(d => ({slug: d.slug, title: d.title, summary: d.summary}));

writeFileSync(outPath, JSON.stringify(topics));
console.log(`Wrote ${outPath}`);