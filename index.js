const fs = require("fs");
const express = require("express");
const app = express();

app.get("/videos/:videoName", (req, res, next) => {
  const { videoName } = req.params;
  const videoFile = __dirname + `/videos/${videoName}`;

  fs.stat(videoFile, (err, stats) => {
    if (err) {
      console.log(err);
      return res.status(404).end("<h1>Video Not found</h1>");
    }

    const { range } = req.headers;
    console.log('Range', range);

    const { size } = stats;
    console.log('Size', size);

    const positions = (range || "").replace(/bytes=/, "").split("-");
    console.log('Positions', positions);

    const start = Number(positions[0]);
    console.log('Start', start);

    const end = positions[1] ? parseInt(positions[1], 10) : size - 1;
    console.log('End', end);

    const chunkSize = (end, start) + 1;
    console.log('ChunkSize', chunkSize);

    res.set({
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    res.status(206);

    const stream = fs.createReadStream(videoFile, { start, end });

    stream.on("open", () => {
      stream.pipe(res);
    });
    stream.on("error", (streamErr) => res.end(streamErr));
  });
});

let port = 3000;

app.listen(port, () =>
  console.log(`Video Streaming Server running on port ${port}...`)
);
