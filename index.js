const http = require("http");
const fs = require("fs");
const pdfparse = require("pdf-parse");
const { parse } = require("path/posix");

// const pdfParser = new PDFParser();

const server = http.createServer((req, res) => {
   const reqUrl = req.url;
   if (reqUrl === "/parse") {
      fs.readFile("./textile.pdf", (err, data) => {
         if (err) {
            console.log(err);
         } else {
            const databuffer = fs.readFileSync("./6th.pdf");

            pdfparse(databuffer).then((data) => {
               // console.log(data.text.split(" ").join(""));
               if (data) {
                  const text = data.text.split(" ").join("");

                  const pattern = /\b\d{6}\(\d+\.\d+\)\b/g;
                  const pattern4 = /(\d{6})\{([^{}]+)\}/g;

                  
                  const matches = text.match(pattern);
                  const makereadable = matches.map((i) => {
                     const items = i.replace(")", "").split("(");
                     return {
                        roll: parseFloat(items[0]),
                        result: parseFloat(items[1]),
                     };
                  });

                  const failText = text.match(pattern4);
                  const failMatch = failText.map((i) => {
                     let item = i
                        .replace(/\n/g, "")
                        .replace(/\)/g, ") ")
                        .replace(/}/g, "")
                        .split("{");
                     const subjects = item[1].split(" ,");

                     return { roll: parseInt(item[0]), subjects };
                  });

                  const totalPass = makereadable.length;
                  const totalFail = failMatch.length;
                  const totalStudent = totalFail + totalPass;
                  const successRate = parseFloat(
                     (100 * totalPass) / totalStudent
                  ).toFixed(2);
                  const failureRate = parseFloat(100 - successRate).toFixed(2);

                  fs.writeFileSync(
                     "data.json",
                     JSON.stringify({
                        totalStudent,
                        totalPass,
                        totalFail,
                        successRate: `${successRate}%`,
                        failRate: `${failureRate}%`,
                        data: [...makereadable, ...failMatch],
                     })
                  );

                  res.writeHead(200, { "content-type": "application/json" });
                  res.write(
                     JSON.stringify({
                        totalStudent,
                        totalPass,
                        totalFail,
                        successRate: `${successRate}%`,
                        failRate: `${failureRate}%`,
                        // data: [...makereadable, ...failMatch],
                     })
                  );
                  res.end();
               }
            });

            // res.writeHead(200, { "content-type": "application/json" });
            // res.write(data.toString());%
            // res.end();
         }
      });
   }
});

server.listen(5000, () => console.log("server is running now"));
