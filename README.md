# get-cdids

This rep contains a set of Node.js scripts for extracting metadata for all of the timeseries datasets on the ONS website. Its process is roughly as follows:

1. Get the taxonomy covering all topics on the website.
2. Find which topic pages include timeseries data.
3. Use the timeseries referenced on these pages to find all of the high-level datasets.
4. Download CSVs for these datasets to find all the individual timeseries within them (unique CDIDs).
5. Use "brute force" to find the topic URLs that each of these timeseries sit under (CDIDs within a single dataset are split between multiple topics).
6. Merge all of the extracted data into ***/output/allmetadata.json***

Please note that all of the outputs of the scripts are included in the ***/output/*** folder. You should only need to run the scripts if there is a change to the ONS website taxonomy or available timeseries data.

## Running the scripts

In order to run these scripts, you must have Node.js installed on your system.

First, you will need to install the dependencies:

```bash
npm install
```

Next, you can run all the scripts in sequence with the following command:

```bash
npm run get-cdids
```

The scripts can also be run individually in the following sequence. If the process gets interrupted, you can pick up where you left off:

```bash
npm run get-taxonomy
npm run get-topics
npm run get-pages
npm run get-metadata
npm run fix-metadata
npm run merge-metadata
```

Please note that the `fix-metadata` script takes by far the longest to run as it tests topic paths by "brute force" (within sensbile conditions). If this process gets interrupted, running the command again will continue from where it left off. You would need to delete the file ***/output/metadata.csv*** to start from scratch.
