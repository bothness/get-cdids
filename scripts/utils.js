import https from "https";

export function fetch(url) {
  return new Promise((resolve) => {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(data);
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
  });
}

export function sleep (ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}