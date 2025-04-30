// Script to get the full ONS website taxonomy
// Outputs a nested object representing the full hierarchy with titles and paths
import { writeFileSync } from "fs";
import { fetch } from "./utils.js";

const slugs = ["/businessindustryandtrade", "/economy", "/employmentandlabourmarket", "/peoplepopulationandcommunity"];
const outPath = "./output/taxonomy.json";

async function fetchTopic(slug) {
    try {
        const str = await fetch(`https://www.ons.gov.uk${slug}/data`);
        const json = JSON.parse(str);
        const children = json.sections ? json.sections.map(s => s.uri) : [];
        return {slug, title: json.description.title, summary: json.description.summary, children};
    }
    catch {
        return null;
    }
}

async function makeTaxonomy(slugs) {
    const topics = [];
    for (const slug of slugs) {
        const topic = await fetchTopic(slug);
        if (topic) {
            if (topic.children[0]) topic.children = await makeTaxonomy(topic.children);
            topics.push(topic);
        }
    }
    return topics;
}

console.log("Getting ONS taxonomy...");
const taxonomy = await makeTaxonomy(slugs);
writeFileSync(outPath, JSON.stringify(taxonomy));
console.log(`Wrote ${outPath}`);
