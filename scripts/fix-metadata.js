// Script to establish the correct topic paths for every CDID in every datasets
// Outputs a CSV file with dsid, cdid and topic (path) for every unique CDID
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import { csvParse } from "d3-dsv";
import { fetch, sleep } from "./utils.js";

const inPath = "./output/metadata.json";
const topicsPath = "./output/topics.json";
const outPath = "./output/metadata.csv";

async function testAllTopics(metadata, topics) {
    let cdids = [];
    if (!existsSync(outPath)) {
        writeFileSync(outPath, "dsid,cdid,topic\n");
    } else {
        cdids = csvParse(readFileSync(outPath, { encoding: 'utf8', flag: 'r' }));
    }
    const total = metadata.map(m => m.cdids.length).reduce((a, b) => a + b, 0);
    let count = 0;
    const allmetadata = [];
    for (const dataset of metadata) {
        const ds = {...dataset};
        ds.cdids = [];
        let slugs = [
            dataset.topic,
            ...topics.filter(t => t.slug.split("/")[1] === dataset.topic.split("/")[1] && t.slug !== dataset.topic).map(t => t.slug)
        ];
        slugs = [
            ...slugs.filter(s => s.split("/")?.[2] === slugs[0].split("/")?.[2]),
            ...slugs.filter(s => s.split("/")?.[2] !== slugs[0].split("/")?.[2])
        ];
        let lastSlug = slugs[0]; // The topic for the last CDID is the most likely topic for the next
        for (const cdid of dataset.cdids) {
            count += 1;
            if (count % 100 === 0) console.log(`Processed ${count.toLocaleString()} of ${total.toLocaleString()} cdids...`);
            if (count >= cdids.length) {
                const newcdid = {...cdid}

                async function testSlugs(slugs) {
                    const _slugs = [lastSlug, ...slugs.filter(s => s !== lastSlug)];
                    for (const slug of _slugs) {
                        try {
                            await sleep(300);
                            const url = `https://www.ons.gov.uk${slug}/timeseries/${cdid.cdid}/data`;
                            const str = await fetch(url);
                            const json = JSON.parse(str);
                            if (json) {
                                newcdid.topic = slug;
                                lastSlug = slug;
                                break;
                            }
                        } catch {
                            console.log(`Failed ${cdid.cdid} ${slug}`);
                        }
                    }
                }
                await testSlugs(slugs);
                
                if (!newcdid.topic) {
                    console.log(`No topic found for ${cdid.cdid}. Trying all topics...`);
                    const altSlugs = topics.filter(t => t.slug.split("/")[1] !== dataset.topic.split("/")[1]).map(t => t.slug);
                    await testSlugs(altSlugs);

                    if (!newcdid.topic) console.log(`No topic found for ${cdid.cdid}.`);
                }
                appendFileSync(outPath, `${dataset.id},${newcdid.cdid},${newcdid.topic || ''}\n`, "utf8");
            }
        }
        allmetadata.push(ds);
    }
}

console.log("Finding topic paths for all CDIDs (takes a LONG time)...");
const metadata = JSON.parse(
    readFileSync(inPath, { encoding: 'utf8', flag: 'r' })
);
const topics = JSON.parse(
    readFileSync(topicsPath, { encoding: 'utf8', flag: 'r' })
);
testAllTopics(metadata, topics);
