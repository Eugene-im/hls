const express = require('express');
const app = express();
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');


app.listen(8000);

app.get('/*', function (req, res) {
    res.send(req.url + " hello " + req.headers["user-agent"]);

ffmpeg('rtsp://login:password@1.1.1.1:554/Streaming/Channels/1802', { timeout: 432000 }).addOptions([
    '-c:v libx264',
    '-c:a aac',
    '-ac 1',
    '-strict -2',
    '-crf 18',
    '-profile:v baseline',
    '-maxrate 400k',
    '-bufsize 1835k',
    '-pix_fmt yuv420p',
    '-hls_time 10',
    '-hls_list_size 6',
    '-hls_wrap 10',
    '-start_number 1'
  ]).output('video/output.m3u8').on('end', callback).run()
});
 
function callback() { console.log("ok") }



